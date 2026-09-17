import {
  CASEY_BOUNDARY_REPLY, CASEY_CONSENT_VERSION, CASEY_CRISIS_REPLY, CASEY_MAX_HISTORY,
  CASEY_MAX_MESSAGE, CASEY_MODEL, CASEY_NO_MATCH_REPLY, CASEY_ROUTING_INSTRUCTIONS,
  decisionSchema, deduplicateResources, isCrisisMessage, parseDecision, renderDecision,
  type CaseyResource, type CaseyTurn,
} from '../../../lib/casey-contract.ts';

type Config = { supabaseUrl: string; anonKey: string; serviceKey: string; openaiKey: string; model?: string; timeoutMs?: number };
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
class RequestError extends Error { constructor(public status: number, public code: string) { super(code); } }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } });

async function boundedJson(request: Request, signal: AbortSignal): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'invalid_request');
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  if (signal.aborted) cancel();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (signal.aborted) throw new RequestError(408, 'timed_out');
      if (done) break;
      size += value.length;
      if (size > 6_000_000) { await reader.cancel(); throw new RequestError(413, 'request_too_large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, 'invalid_request');
  } finally {
    signal.removeEventListener('abort', cancel);
  }
}

export function createCaseyHandler(config: Config, transport: typeof fetch = fetch) {
  const dbHeaders = { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' };
  const call = (url: string, init: RequestInit, signal: AbortSignal) => transport(url, { ...init, signal });
  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(config.timeoutMs ?? 28000)]);
    try {
      if (![config.supabaseUrl, config.anonKey, config.serviceKey, config.openaiKey].every(Boolean)) throw new RequestError(503, 'not_configured');
      const bearer = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? '';
      if (!bearer) throw new RequestError(401, 'sign_in_required');
      let userId: string | null = null;
      if (bearer !== config.anonKey) {
        const auth = await call(`${config.supabaseUrl}/auth/v1/user`, { headers: { apikey: config.anonKey, Authorization: `Bearer ${bearer}` } }, signal);
        if (!auth.ok) throw new RequestError(401, 'sign_in_required');
        const user = await auth.json();
        if (typeof user.id !== 'string') throw new RequestError(401, 'sign_in_required');
        userId = user.id;
      }
      const body = await boundedJson(request, signal);
      if (body.consentVersion !== CASEY_CONSENT_VERSION) throw new RequestError(403, 'consent_required');
      if (!['chat', 'speech', 'transcribe'].includes(String(body.action))) throw new RequestError(400, 'invalid_action');
      // Hash addresses with a server secret; never store raw IPs or messages.
      // Hosted Supabase receives CF-Connecting-IP from its Cloudflare gateway.
      // If gateway forwarding is unavailable all guests share a conservative
      // bucket. The global circuit breaker bounds provider use even if clients
      // rotate addresses or create accounts. It is not a DDoS guarantee.
      const ip = (request.headers.get('cf-connecting-ip') ?? (request.headers.get('x-forwarded-for') ?? 'unknown').split(',').at(-1)!).trim().slice(0,100);
      const hmac = await crypto.subtle.importKey('raw', new TextEncoder().encode(config.serviceKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const hashed = new Uint8Array(await crypto.subtle.sign('HMAC', hmac, new TextEncoder().encode(userId ? `user:${userId}` : `guest:${ip}`)));
      const actor = Array.from(hashed, (b) => b.toString(16).padStart(2, '0')).join('');
      const quota = await call(`${config.supabaseUrl}/rest/v1/rpc/consume_casey_quota`, { method: 'POST', headers: dbHeaders, body: JSON.stringify({ actor, signed_in: !!userId }) }, signal);
      if (!quota.ok) throw new RequestError(503, 'temporarily_unavailable');
      if (await quota.json() !== true) throw new RequestError(429, 'busy');

      const openai = async (path: string, payload: unknown, form = false) => {
        const response = await call(`https://api.openai.com/v1/${path}`, {
          method: 'POST', headers: { Authorization: `Bearer ${config.openaiKey}`, ...(form ? {} : { 'Content-Type': 'application/json' }) },
          body: form ? payload as FormData : JSON.stringify(payload),
        }, signal);
        if (response.status === 429) throw new RequestError(429, 'busy');
        if (!response.ok) throw new RequestError(503, 'temporarily_unavailable');
        return response;
      };

      if (body.action === 'speech') {
        if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 2400) throw new RequestError(400, 'invalid_speech');
        const audio = await openai('audio/speech', { model: 'gpt-4o-mini-tts', voice: body.voice === 'male' ? 'onyx' : 'nova', input: body.text, response_format: 'mp3', instructions: 'Speak warmly and clearly at a relaxed pace. Read phone numbers digit by digit.' });
        const bytes = new Uint8Array(await audio.arrayBuffer());
        let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
        return json({ audio: btoa(binary) });
      }
      if (body.action === 'transcribe') {
        if (typeof body.audio !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.audio) || body.audio.length > 5_600_000 || !body.audio.length) throw new RequestError(400, 'invalid_audio');
        let binary: string;
        try { binary = atob(body.audio); } catch { throw new RequestError(400, 'invalid_audio'); }
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const form = new FormData();
        form.append('file', new Blob([bytes], { type: 'audio/mp4' }), 'recording.m4a');
        form.append('model', 'gpt-transcribe');
        form.append('language', 'en');
        const audio = await openai('audio/transcriptions', form, true);
        const result = await audio.json();
        if (typeof result.text !== 'string') throw new RequestError(503, 'temporarily_unavailable');
        return json({ text: result.text.trim().slice(0, CASEY_MAX_MESSAGE) });
      }

      if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > CASEY_MAX_MESSAGE) throw new RequestError(400, 'invalid_message');
      if (isCrisisMessage(body.message)) return json({ reply: CASEY_CRISIS_REPLY, resourceIds: [], kind: 'crisis' });
      const history: CaseyTurn[] = [];
      if (body.history !== undefined && !Array.isArray(body.history)) throw new RequestError(400, 'invalid_history');
      for (const item of (body.history as unknown[] ?? []).slice(-CASEY_MAX_HISTORY)) {
        if (!item || typeof item !== 'object') throw new RequestError(400, 'invalid_history');
        const turn = item as CaseyTurn;
        if (!['user','assistant'].includes(turn.role) || typeof turn.content !== 'string' || turn.content.length > 3000) throw new RequestError(400, 'invalid_history');
        history.push({ role: turn.role, content: turn.content });
      }
      // The server loads the authoritative directory; client-supplied records,
      // model names, prompts and URLs are never accepted.
      const directory = await call(`${config.supabaseUrl}/rest/v1/resources?select=id,name,description,phone,address,city,tags,hours,website,last_verified&is_published=eq.true&order=id&limit=500`, { headers: dbHeaders }, signal);
      if (!directory.ok) throw new RequestError(503, 'directory_unavailable');
      const resources: CaseyResource[] = deduplicateResources(await directory.json());
      if (!resources.length) return json({ reply: CASEY_NO_MATCH_REPLY, resourceIds: [], kind: 'no_match' });
      let profile = '';
      if (body.personalize === true && userId) {
        const answers = await call(`${config.supabaseUrl}/rest/v1/survey_answers?select=question_id,answer&user_id=eq.${encodeURIComponent(userId)}`, { headers: dbHeaders }, signal);
        if (!answers.ok) throw new RequestError(503, 'temporarily_unavailable');
        const allowed = new Set(['preferred_name','zip_code','immediate_needs','employment_status','work_interests','housing_status','financial_help','education_level','education','learning_interest','support_system']);
        profile = JSON.stringify((await answers.json()).filter((r: { question_id: string }) => allowed.has(r.question_id))).slice(0,4000);
      }
      const response = await openai('responses', {
        model: config.model ?? CASEY_MODEL, reasoning: { effort: 'none' }, store: false, max_output_tokens: 450,
        input: [
          { role: 'system', content: CASEY_ROUTING_INSTRUCTIONS + '\nDIRECTORY DATA:\n' + JSON.stringify(resources.map(({id,name,description,tags,city}) => ({id,name,description,tags,city}))) },
          ...(profile ? [{ role: 'user', content: 'Optional profile data: ' + profile }] : []),
          ...history, { role: 'user', content: body.message.trim() },
        ],
        text: { format: { type: 'json_schema', name: 'casey_decision', strict: true, schema: decisionSchema(resources) } },
      });
      const result = await response.json();
      const content = (result.output ?? []).flatMap((item: { content?: unknown[] }) => item.content ?? []);
      // Refusals never fall back to another provider or less constrained path.
      if (content.some((item: { type: string }) => item.type === 'refusal')) return json({ reply: CASEY_BOUNDARY_REPLY, resourceIds: [], kind: 'boundary' });
      if (result.status !== 'completed') throw new RequestError(503, 'temporarily_unavailable');
      const text = content.filter((item: { type: string }) => item.type === 'output_text').map((item: { text: string }) => item.text).join('');
      const decision = parseDecision(JSON.parse(text), resources);
      return json({ reply: renderDecision(decision, resources), resourceIds: decision.resource_ids, kind: decision.action });
    } catch (error) {
      // Do not return or log upstream errors: they can contain submitted data.
      if (error instanceof RequestError) return json({ error: error.code }, error.status);
      return json({ error: signal.aborted ? 'timed_out' : 'temporarily_unavailable' }, 503);
    }
  };
}
