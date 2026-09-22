import { CASEY_CONSENT_VERSION } from './casey-contract';
import { withTimeout } from './network';
import { CaseyRequestError, readCaseyResponse } from './casey-response';


type Config = {
  url: string;
  anonKey: string;
  getSession: () => Promise<{ data: { session: { access_token: string } | null }; error: unknown }>;
  transport?: typeof fetch;
};

export function createCaseyClient(config: Config) {
  const pending = new Set<AbortController>();
  function cancelCaseyRequests() {
    for (const controller of pending) controller.abort();
    pending.clear();
  }

  async function requestCasey<T>(body: Record<string, unknown>, allowed: () => boolean): Promise<T> {
    if (!allowed()) throw new CaseyRequestError('consent_required');
    const controller = new AbortController();
    pending.add(controller);
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      const { data, error } = await withTimeout(config.getSession(), 10000, 'Restoring your session timed out.');
      if (error) throw new CaseyRequestError('sign_in_required');
      if (!allowed() || controller.signal.aborted) throw new CaseyRequestError('consent_required');
      const response = await (config.transport ?? fetch)(`${config.url}/functions/v1/casey`, {
        method: 'POST', signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          apikey: config.anonKey,
          Authorization: `Bearer ${data.session?.access_token ?? config.anonKey}`,
        },
        body: JSON.stringify({ ...body, consentVersion: CASEY_CONSENT_VERSION }),
      });
      const result = await readCaseyResponse(response);
      if (!allowed() || controller.signal.aborted) throw new CaseyRequestError('consent_required');
      return result as T;
    } finally {
      clearTimeout(timer);
      pending.delete(controller);
    }
  }
  return { requestCasey, cancelCaseyRequests };
}
