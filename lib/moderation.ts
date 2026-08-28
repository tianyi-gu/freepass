import { supabase } from '@/lib/supabase';

// Apple guideline 1.2 requires UGC apps to provide: a filter for
// objectionable content, a way to report content, and a way to block users.
// This module is the shared client side of all three; the tables and RLS
// policies live in scripts/production-launch-fixes.sql.

export type ReportContentType = 'community_post' | 'question' | 'answer' | 'resource' | 'event';

// Word-boundary filter for clearly objectionable language. Intentionally a
// blunt instrument: it exists to stop drive-by abuse on a small community
// board, not to be exhaustive. Reports + staff review cover the rest.
const BLOCKED_WORDS = [
  'fuck', 'fucking', 'fucker', 'motherfucker',
  'shit', 'bullshit',
  'bitch', 'bitches',
  'asshole', 'assholes',
  'cunt',
  'dick', 'dickhead',
  'pussy',
  'nigger', 'nigga',
  'faggot', 'fag',
  'retard', 'retarded',
  'spic', 'wetback', 'chink', 'kike',
  'whore', 'slut',
  'rape',
  'kys',
];

const BLOCKED_RE = new RegExp(`\\b(${BLOCKED_WORDS.join('|')})\\b`, 'i');

export function containsBlockedLanguage(text: string): boolean {
  return BLOCKED_RE.test(text);
}

export const BLOCKED_LANGUAGE_MESSAGE =
  'Your post contains language that isn’t allowed on the community board. Please keep this space kind and supportive.';

// Anyone — including guests — can file a report; reporterId is null for
// guests. Reports are readable only by staff.
export async function submitReport(
  contentType: ReportContentType,
  contentId: string,
  reporterId: string | null,
  reason?: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reports').insert({
    content_type: contentType,
    content_id: contentId,
    reporter_id: reporterId,
    reason: reason ?? null,
  });
  return { error: error ? error.message : null };
}

export async function blockUser(
  blockerId: string,
  blockedId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('blocked_users')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  // Blocking someone twice is fine — treat the unique-violation as success.
  if (error && error.code === '23505') return { error: null };
  return { error: error ? error.message : null };
}

// User ids this user has blocked; content they authored gets hidden.
// Returns an empty set on failure so feeds still render.
export async function fetchBlockedIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.blocked_id as string));
}
