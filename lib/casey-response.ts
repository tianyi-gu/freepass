export class CaseyRequestError extends Error {
  constructor(public code: string) { super(code); }
}

export async function readCaseyResponse(response: Response): Promise<unknown> {
  // Gateways can return HTML or no body even when the handler uses JSON.
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error : response.status === 429 ? 'busy' : 'temporarily_unavailable';
    throw new CaseyRequestError(code);
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new CaseyRequestError('temporarily_unavailable');
  return result;
}
