// Network hardening shared by the Supabase client and the auth flow.
//
// React Native's fetch has no total-request timeout: a backend that accepts
// the TCP connection and then stalls (a paused Supabase project, a database
// out of disk-IO budget, a bad cell link) keeps the promise pending for a
// minute or more — long enough that App Review saw an "indefinite loading
// state" on login. Every network-dependent step must fail within a bounded
// time and surface a retryable error instead.

export class TimeoutError extends Error {
  constructor(message = 'The request timed out.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** Rejects with TimeoutError if `promise` hasn't settled within `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * Builds a `fetch` that aborts after `timeoutFor(url)` milliseconds. Meant to
 * be handed to `createClient(..., { global: { fetch } })` so auth, PostgREST,
 * and storage calls all inherit a hard upper bound. Respects a caller-provided
 * AbortSignal as well.
 */
export function createTimeoutFetch(timeoutFor: (url: string) => number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutFor(requestUrl(input)));

    // A caller can cancel via init.signal or, for a Request object, the
    // signal it was constructed with — honour whichever is present.
    const upstream =
      init?.signal ??
      (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined);
    if (upstream) {
      if (upstream.aborted) controller.abort();
      else upstream.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      return await globalThis.fetch(input, { ...init, signal: controller.signal });
    } catch (err) {
      // Surface our own timeout distinctly from a caller-initiated abort so
      // error messages can say "timed out" rather than a bare "Aborted".
      if (timedOut) throw new TimeoutError();
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}

const NETWORK_ERROR_NAMES = new Set(['TimeoutError', 'AbortError', 'AuthRetryableFetchError']);
const NETWORK_ERROR_PATTERNS = [
  /timed?\s?out/i,
  /network request failed/i,
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /network error/i,
  /aborted/i,
  /econnrefused|enotfound|econnreset/i,
];

/**
 * True when an error is a connectivity/availability failure (offline, server
 * unreachable, request timed out) rather than something the user did wrong.
 * Covers errors thrown by fetch, auth-js, and postgrest-js result objects.
 */
export function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const { name, message, status } = err as { name?: unknown; message?: unknown; status?: unknown };
  if (typeof name === 'string' && NETWORK_ERROR_NAMES.has(name)) return true;
  if (typeof status === 'number' && [0, 502, 503, 504, 540].includes(status)) return true;
  if (typeof message === 'string' && NETWORK_ERROR_PATTERNS.some((re) => re.test(message))) return true;
  return false;
}

export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach FreePass right now. Check your internet connection and try again. If it keeps happening, please try again in a few minutes.";

/** Plain-language message for an auth/network failure, safe to show users. */
export function friendlyErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isNetworkError(err)) return NETWORK_ERROR_MESSAGE;
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (/invalid login credentials/i.test(message)) {
    return "That email and password don't match. Please check them and try again.";
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email first. Check your inbox (and spam folder) for the link we sent you.';
  }
  return message || fallback;
}
