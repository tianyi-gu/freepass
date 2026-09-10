import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AI_CONSENT_STORAGE_KEY, AI_CONSENT_VERSION } from '@/constants/ai-consent';
import { useUser } from '@/contexts/user-context';

// Informed consent for sending data to the third-party AI services behind
// Casey (Google Gemini, Groq, OpenAI). Nothing may be sent to any of them
// unless `status === 'accepted'`. The decision is stored on the device, wiped
// on logout/account deletion (see LOCAL_DATA_KEYS in user-context) so the next
// person on a shared phone is asked again, and re-asked whenever
// AI_CONSENT_VERSION changes.

export type AiConsentStatus =
  // Still reading the stored decision — render nothing AI-related yet.
  | 'loading'
  // Never asked (or asked under an older disclosure version) — show the notice.
  | 'unknown'
  | 'accepted'
  | 'declined';

type StoredConsent = {
  version: number;
  status: 'accepted' | 'declined';
  decidedAt: string;
};

interface AiConsentValue {
  status: AiConsentStatus;
  /** Timestamp of the current decision, if any (for display in Settings). */
  decidedAt: string | null;
  accept: () => Promise<void>;
  decline: () => Promise<void>;
}

const AiConsentContext = createContext<AiConsentValue | null>(null);

async function readStoredConsent(): Promise<StoredConsent | null> {
  try {
    const raw = await AsyncStorage.getItem(AI_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      parsed &&
      parsed.version === AI_CONSENT_VERSION &&
      (parsed.status === 'accepted' || parsed.status === 'declined')
    ) {
      return {
        version: parsed.version,
        status: parsed.status,
        decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : '',
      };
    }
    // Older version or malformed — treat as never asked.
    return null;
  } catch {
    return null;
  }
}

export function AiConsentProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [stored, setStored] = useState<StoredConsent | null | undefined>(undefined);

  // Re-read whenever the signed-in identity changes: logout clears the key,
  // and the next user must make their own decision.
  const userId = user?.id ?? null;
  useEffect(() => {
    let cancelled = false;
    setStored(undefined);
    readStoredConsent().then((value) => {
      if (!cancelled) setStored(value);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const record = useCallback(async (status: 'accepted' | 'declined') => {
    const next: StoredConsent = {
      version: AI_CONSENT_VERSION,
      status,
      decidedAt: new Date().toISOString(),
    };
    // Update state first so the UI (and the send guards) react immediately
    // even if the disk write is slow or fails.
    setStored(next);
    try {
      await AsyncStorage.setItem(AI_CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      if (__DEV__) console.error('[AiConsent] failed to persist decision:', err);
    }
  }, []);

  const accept = useCallback(() => record('accepted'), [record]);
  const decline = useCallback(() => record('declined'), [record]);

  const value = useMemo<AiConsentValue>(
    () => ({
      status: stored === undefined ? 'loading' : stored === null ? 'unknown' : stored.status,
      decidedAt: stored?.decidedAt || null,
      accept,
      decline,
    }),
    [stored, accept, decline],
  );

  return <AiConsentContext.Provider value={value}>{children}</AiConsentContext.Provider>;
}

export function useAiConsent() {
  const ctx = useContext(AiConsentContext);
  if (!ctx) throw new Error('useAiConsent must be used within an AiConsentProvider');
  return ctx;
}
