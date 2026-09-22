export const AI_CONSENT_VERSION = 3;
export type StoredAiConsent = {
  version: number;
  status: 'accepted' | 'declined';
  decidedAt: string;
  owner: string;
};

export function parseAiConsent(raw: string | null, owner: string): StoredAiConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== AI_CONSENT_VERSION || value.owner !== owner
      || !['accepted', 'declined'].includes(value.status)
      || typeof value.decidedAt !== 'string' || !Number.isFinite(Date.parse(value.decidedAt))) return null;
    return { version: value.version, owner: value.owner, status: value.status, decidedAt: value.decidedAt };
  } catch { return null; }
}
