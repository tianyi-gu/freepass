import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { createTimeoutFetch } from '@/lib/network';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.',
  );
}

// Hard upper bound on every Supabase request (auth, database, storage). The
// free-tier project auto-pauses when idle and can run out of disk-IO budget;
// in both states requests may stall rather than fail. Without this, login and
// bootstrap could spin indefinitely — the exact behaviour App Review rejected.
export const SUPABASE_REQUEST_TIMEOUT_MS = 15000;
// Document uploads/downloads carry photo-sized payloads over cell links, so
// give the storage API more room while still guaranteeing an eventual error.
export const SUPABASE_STORAGE_TIMEOUT_MS = 60000;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: createTimeoutFetch((url) =>
      url.includes('/storage/v1/') ? SUPABASE_STORAGE_TIMEOUT_MS : SUPABASE_REQUEST_TIMEOUT_MS,
    ),
  },
});
