import { CASEY_CONSENT_VERSION } from './casey-contract';
import { supabase } from './supabase';
import { withTimeout } from './network';

const pending = new Set<AbortController>();
export function cancelCaseyRequests() {
  for (const controller of pending) controller.abort();
  pending.clear();
}
export class CaseyRequestError extends Error {
  constructor(public code: string) { super(code); }
}

export async function requestCasey<T>(body: Record<string, unknown>, allowed: () => boolean): Promise<T> {
  if (!allowed()) throw new CaseyRequestError('consent_required');
  const controller = new AbortController();
  pending.add(controller);
  const timer = setTimeout(() => controller.abort(), 35000);
  try {
    const { data, error } = await withTimeout(supabase.auth.getSession(), 10000, 'Restoring your session timed out.');
    if (error) throw new CaseyRequestError('sign_in_required');
    if (!allowed() || controller.signal.aborted) throw new CaseyRequestError('consent_required');
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/casey`, {
      method: 'POST', signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${data.session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ ...body, consentVersion: CASEY_CONSENT_VERSION }),
    });
    const result = await response.json();
    if (!allowed() || controller.signal.aborted) throw new CaseyRequestError('consent_required');
    if (!response.ok) throw new CaseyRequestError(typeof result.error === 'string' ? result.error : 'temporarily_unavailable');
    return result as T;
  } finally {
    clearTimeout(timer);
    pending.delete(controller);
  }
}
