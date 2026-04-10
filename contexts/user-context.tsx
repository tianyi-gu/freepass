import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

const GUEST_STORAGE_KEY = '@freepass_guest';

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
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  saveSurveyAnswers: (answers: Record<string, string | string[]>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

function sessionToProfile(session: Session, profile?: { display_name?: string; onboarding_complete?: boolean }): UserProfile {
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: profile?.display_name ?? session.user.user_metadata?.display_name ?? session.user.email?.split('@')[0],
    isGuest: false,
    onboardingComplete: profile?.onboarding_complete ?? false,
    surveyAnswers: {},
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    async function init() {
      // Check for guest session first
      const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
      if (guestData) {
        setUser(JSON.parse(guestData));
        setIsLoading(false);
        return;
      }

      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, onboarding_complete')
          .eq('id', session.user.id)
          .single();
        setUser(sessionToProfile(session, profile ?? undefined));
      }
      setIsLoading(false);
    }
    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, onboarding_complete')
          .eq('id', session.user.id)
          .single();
        setUser(sessionToProfile(session, profile ?? undefined));
        // Clear guest data if they sign in
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      } else {
        // Only clear user if no guest session
        const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
        if (!guestData) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
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
    if (!user || user.isGuest) return;

    // Upsert each answer to Supabase
    const upserts = Object.entries(answers).map(([questionId, answer]) => ({
      user_id: user.id,
      question_id: questionId,
      answer: JSON.stringify(answer),
    }));

    if (upserts.length > 0) {
      await supabase
        .from('survey_answers')
        .upsert(upserts, { onConflict: 'user_id,question_id' });
    }

    setUser((prev) => prev ? {
      ...prev,
      surveyAnswers: { ...prev.surveyAnswers, ...answers },
    } : prev);
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    if (!user.isGuest) {
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);
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
