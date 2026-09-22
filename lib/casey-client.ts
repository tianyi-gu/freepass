import { supabase } from './supabase';
import { createCaseyClient } from './casey-client-core';
export { CaseyRequestError } from './casey-response';

export const { requestCasey, cancelCaseyRequests } = createCaseyClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  getSession: () => supabase.auth.getSession(),
});
