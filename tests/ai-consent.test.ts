import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_CONSENT_VERSION, parseAiConsent } from '../lib/ai-consent-record';
import { createCaseyClient } from '../lib/casey-client-core';
import { CaseyRequestError } from '../lib/casey-response';

const decision = { version: AI_CONSENT_VERSION, owner: 'guest', status: 'accepted', decidedAt: '2026-09-22T00:00:00Z' };
const getSession = async () => ({ data: { session: null }, error: null });
const config = { url: 'https://freepass.test', anonKey: 'public-test-key', getSession };
const denied = (e: unknown) => e instanceof CaseyRequestError && e.code === 'consent_required';

test('only a valid current disclosure decision for the current identity is restored', () => {
  assert.deepEqual(parseAiConsent(JSON.stringify(decision), 'guest'), decision);
  for (const raw of [null, '', '{bad', 'null', JSON.stringify({ ...decision, version: 2 }), JSON.stringify({ ...decision, version: 1 }), JSON.stringify({ ...decision, decidedAt: 'bad' }), JSON.stringify({ ...decision, status: 'yes' })]) {
    assert.equal(parseAiConsent(raw, 'guest'), null);
  }
  assert.equal(parseAiConsent(JSON.stringify(decision), 'different-user'), null);
  assert.equal(parseAiConsent(JSON.stringify({ ...decision, owner: 'alice' }), 'bob'), null);
});

test('chat, transcription and speech make zero network requests without consent', async () => {
  const calls: string[] = [];
  const client = createCaseyClient({ ...config, getSession: async () => { calls.push('session'); return getSession(); }, transport: async () => { calls.push('network'); return Response.json({}); } });
  for (const action of ['chat', 'speech', 'transcribe']) {
    await assert.rejects(client.requestCasey({ action }, () => false), denied);
  }
  assert.deepEqual(calls, []);
});

test('revoking while session restoration is pending prevents transmission', async () => {
  let release!: (value: Awaited<ReturnType<typeof getSession>>) => void;
  let allowed = true; let sent = 0;
  const client = createCaseyClient({ ...config, getSession: () => new Promise(resolve => { release = resolve; }), transport: async () => { sent++; return Response.json({}); } });
  const pending = client.requestCasey({ action: 'chat', message: 'private' }, () => allowed);
  allowed = false; client.cancelCaseyRequests(); release(await getSession());
  await assert.rejects(pending, denied);
  assert.equal(sent, 0);
});

test('revocation aborts in-flight requests and discards late responses', async () => {
  let received!: () => void; let finish!: (response: Response) => void; let signal: AbortSignal | undefined;
  const started = new Promise<void>(resolve => { received = resolve; });
  let allowed = true;
  const client = createCaseyClient({ ...config, transport: async (_url, init) => { signal = init?.signal as AbortSignal; received(); return new Promise(resolve => { finish = resolve; }); } });
  const pending = client.requestCasey({ action: 'speech', text: 'example' }, () => allowed);
  await started; allowed = false; client.cancelCaseyRequests();
  assert.equal(signal?.aborted, true);
  finish(Response.json({ audio: 'late' }));
  await assert.rejects(pending, denied);
});

test('explicit consent enables all three actions through the authenticated backend', async () => {
  const calls: { url: string; body: Record<string, unknown>; authorization: string | null }[] = [];
  const client = createCaseyClient({ ...config, transport: async (url, init) => { calls.push({ url: String(url), body: JSON.parse(String(init?.body)), authorization: new Headers(init?.headers).get('Authorization') }); return Response.json({ ok: true }); } });
  for (const action of ['chat', 'speech', 'transcribe']) assert.deepEqual(await client.requestCasey({ action }, () => true), { ok: true });
  assert.deepEqual(calls.map(x => x.body.action), ['chat', 'speech', 'transcribe']);
  assert.ok(calls.every(x => x.url === 'https://freepass.test/functions/v1/casey' && x.authorization === 'Bearer public-test-key'));
});
