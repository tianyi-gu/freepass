import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY_USER = '@freepass_user';

export interface UserProfile {
  email?: string;
  displayName?: string;
  isGuest: boolean;
  onboardingComplete: boolean;
  surveyAnswers: Record<string, string | string[]>;
  createdAt: string;
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_USER).then((stored) => {
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback(async (profile: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    // TODO: Replace with real backend auth
    const profile: UserProfile = {
      email,
      displayName,
      isGuest: false,
      onboardingComplete: false,
      surveyAnswers: {},
      createdAt: new Date().toISOString(),
    };
    await persist(profile);
  }, [persist]);

  const logIn = useCallback(async (email: string, _password: string) => {
    // TODO: Replace with real backend auth
    const profile: UserProfile = {
      email,
      displayName: email.split('@')[0],
      isGuest: false,
      onboardingComplete: true, // returning user, skip onboarding
      surveyAnswers: {},
      createdAt: new Date().toISOString(),
    };
    await persist(profile);
  }, [persist]);

  const continueAsGuest = useCallback(async () => {
    const profile: UserProfile = {
      isGuest: true,
      onboardingComplete: true, // guests skip onboarding
      surveyAnswers: {},
      createdAt: new Date().toISOString(),
    };
    await persist(profile);
  }, [persist]);

  const saveSurveyAnswers = useCallback(async (answers: Record<string, string | string[]>) => {
    if (!user) return;
    const updated = { ...user, surveyAnswers: { ...user.surveyAnswers, ...answers } };
    await persist(updated);
  }, [user, persist]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    const updated = { ...user, onboardingComplete: true };
    await persist(updated);
  }, [user, persist]);

  const logOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
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
