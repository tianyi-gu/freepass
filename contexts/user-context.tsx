import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

const GUEST_STORAGE_KEY = '@freepass_guest';
// Survey answers collected before the user has an authenticated session
// (email confirmation pending, or guest browsing). Flushed to Supabase on
// the first sign-in — without this, answers given right after signup are
// lost because writes require an authenticated session under RLS.
const PENDING_SURVEY_KEY = '@freepass_pending_survey';
const PENDING_ONBOARDING_KEY = '@freepass_pending_onboarding_complete';
// The auth user id the pending data belongs to (known at signup time even
// without a session). Guards against a different account logging in on a
// shared device and absorbing someone else's answers.
const PENDING_OWNER_KEY = '@freepass_pending_owner';

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  isGuest: boolean;
  onboardingComplete: boolean;
  surveyAnswers: Record<string, string | string[]>;
}

interface UserContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string, zipCode?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  saveSurveyAnswers: (answers: Record<string, string | string[]>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

function normalizeSurveyAnswers(
  rows: { question_id: string; answer: string | string[] }[] | null,
): Record<string, string | string[]> {
  const answers: Record<string, string | string[]> = {};
  for (const row of rows ?? []) {
    answers[row.question_id] = row.answer;
  }
  return answers;
}

function sessionToProfile(
  session: Session,
  profile?: { display_name?: string; onboarding_complete?: boolean },
  surveyAnswers: Record<string, string | string[]> = {},
): UserProfile {
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: profile?.display_name ?? session.user.user_metadata?.display_name ?? session.user.email?.split('@')[0],
    isGuest: false,
    onboardingComplete: profile?.onboarding_complete ?? false,
    surveyAnswers,
  };
}

// Merge answers into the locally-stashed pending survey data.
async function stashPendingAnswers(answers: Record<string, string | string[]>): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SURVEY_KEY);
    let existing: Record<string, string | string[]> = {};
    if (raw) {
      try { existing = JSON.parse(raw); } catch { /* corrupted — overwrite */ }
    }
    await AsyncStorage.setItem(PENDING_SURVEY_KEY, JSON.stringify({ ...existing, ...answers }));
  } catch (err) {
    if (__DEV__) console.error('[UserContext] stashPendingAnswers failed:', err);
  }
}

// Push any locally-stashed survey answers / onboarding flag to Supabase once
// an authenticated session exists. No-op when nothing is pending.
async function flushPendingLocalData(userId: string): Promise<void> {
  try {
    // If the pending data was collected during a specific account's signup,
    // only flush it into that same account.
    const owner = await AsyncStorage.getItem(PENDING_OWNER_KEY);
    if (owner && owner !== userId) return;

    const raw = await AsyncStorage.getItem(PENDING_SURVEY_KEY);
    if (raw) {
      let pending: Record<string, string | string[]> | null = null;
      try { pending = JSON.parse(raw); } catch { /* corrupted */ }
      const entries = pending ? Object.entries(pending) : [];
      if (entries.length > 0) {
        const upserts = entries.map(([questionId, answer]) => ({
          user_id: userId,
          question_id: questionId,
          answer,
        }));
        const { error } = await supabase
          .from('survey_answers')
          .upsert(upserts, { onConflict: 'user_id,question_id' });
        if (error) {
          if (__DEV__) console.error('[UserContext] flush pending survey failed:', error);
          return; // keep the stash and retry on the next sign-in event
        }
        const zip = pending?.zip_code;
        if (typeof zip === 'string' && zip.trim()) {
          await supabase.from('profiles').update({ zip_code: zip.trim() }).eq('id', userId);
        }
      }
      await AsyncStorage.removeItem(PENDING_SURVEY_KEY);
    }

    const pendingComplete = await AsyncStorage.getItem(PENDING_ONBOARDING_KEY);
    if (pendingComplete) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', userId);
      if (!error) await AsyncStorage.removeItem(PENDING_ONBOARDING_KEY);
    }

    await AsyncStorage.removeItem(PENDING_OWNER_KEY);
  } catch (err) {
    if (__DEV__) console.error('[UserContext] flushPendingLocalData failed:', err);
  }
}

// Fetch the profile + survey answers for a session and assemble a UserProfile.
// Uses maybeSingle() so a brand-new user without a profile row doesn't error.
async function buildProfileFromSession(session: Session): Promise<UserProfile> {
  // Sync any answers collected before this session existed, so the
  // fetch below already sees them.
  await flushPendingLocalData(session.user.id);

  const [{ data: profile }, { data: surveyAnswers }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, onboarding_complete')
      .eq('id', session.user.id)
      .maybeSingle(),
    supabase
      .from('survey_answers')
      .select('question_id, answer')
      .eq('user_id', session.user.id),
  ]);
  return sessionToProfile(session, profile ?? undefined, normalizeSurveyAnswers(surveyAnswers));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    async function init() {
      try {
        // Check for guest session first
        const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
            return;
          } catch {
            // Corrupted guest data — clear it and fall through to auth check
            await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
          }
        }

        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(await buildProfileFromSession(session));
        }
      } catch (err) {
        if (__DEV__) console.error('[UserContext] init failed:', err);
      } finally {
        // Always release the loading gate so the app never hangs on a blank screen
        setIsLoading(false);
      }
    }
    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          setUser(await buildProfileFromSession(session));
          // Clear guest data if they sign in
          await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        } else {
          // Only clear user if no guest session
          const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
          if (!guestData) {
            setUser(null);
          }
        }
      } catch (err) {
        if (__DEV__) console.error('[UserContext] auth change failed:', err);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string, zipCode?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) throw error;

    // When email confirmation is enabled, Supabase returns a fake success
    // for duplicate emails (empty identities array) instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('already registered');
    }

    // Update profile with zip code if provided. Without a session (email
    // confirmation pending) RLS blocks the write, so stash it for the
    // post-confirmation sign-in instead.
    if (zipCode && data.user) {
      if (data.session) {
        await supabase
          .from('profiles')
          .update({ zip_code: zipCode })
          .eq('id', data.user.id);
      } else {
        await stashPendingAnswers({ zip_code: zipCode });
      }
    }

    // Tag any pre-session survey data with this account so it can only
    // ever sync into this account.
    if (data.user && !data.session) {
      try {
        await AsyncStorage.setItem(PENDING_OWNER_KEY, data.user.id);
      } catch (err) {
        if (__DEV__) console.error('[UserContext] pending owner stash failed:', err);
      }
    }

    // If email confirmation is required, the session will be null.
    // The user was still created successfully — the signup screen will
    // show a confirmation message prompting them to check their email.
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const continueAsGuest = useCallback(async () => {
    const guestProfile: UserProfile = {
      id: 'guest',
      isGuest: true,
      onboardingComplete: true,
      surveyAnswers: {},
    };
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
    setUser(guestProfile);
  }, []);

  const saveSurveyAnswers = useCallback(async (answers: Record<string, string | string[]>) => {
    if (!user || user.isGuest) {
      // No authenticated session yet (fresh signup awaiting email
      // confirmation, or guest). Keep the answers locally — they sync to
      // Supabase automatically on the first sign-in.
      await stashPendingAnswers(answers);
      setUser((prev) => prev?.isGuest ? {
        ...prev,
        surveyAnswers: { ...prev.surveyAnswers, ...answers },
      } : prev);
      return;
    }

    // Upsert each answer to Supabase
    const upserts = Object.entries(answers).map(([questionId, answer]) => ({
      user_id: user.id,
      question_id: questionId,
      answer,
    }));

    if (upserts.length > 0) {
      const { error } = await supabase
        .from('survey_answers')
        .upsert(upserts, { onConflict: 'user_id,question_id' });
      if (error && __DEV__) console.error('[UserContext] saveSurveyAnswers failed:', error);
    }

    if (typeof answers.zip_code === 'string' && answers.zip_code.trim()) {
      const { error } = await supabase
        .from('profiles')
        .update({ zip_code: answers.zip_code.trim() })
        .eq('id', user.id);
      if (error && __DEV__) console.error('[UserContext] zip_code update failed:', error);
    }

    setUser((prev) => prev ? {
      ...prev,
      surveyAnswers: { ...prev.surveyAnswers, ...answers },
    } : prev);
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      // Signed up but not signed in yet — record completion locally and
      // sync it on the first sign-in.
      try {
        await AsyncStorage.setItem(PENDING_ONBOARDING_KEY, 'true');
      } catch (err) {
        if (__DEV__) console.error('[UserContext] pending onboarding stash failed:', err);
      }
      return;
    }

    if (!user.isGuest) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);
      if (error && __DEV__) console.error('[UserContext] completeOnboarding failed:', error);
    }

    setUser((prev) => prev ? { ...prev, onboardingComplete: true } : prev);
  }, [user]);

  const logOut = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    signUp,
    logIn,
    continueAsGuest,
    saveSurveyAnswers,
    completeOnboarding,
    logOut,
  }), [user, isLoading, signUp, logIn, continueAsGuest, saveSurveyAnswers, completeOnboarding, logOut]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
