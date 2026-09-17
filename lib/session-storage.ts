import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Supabase sessions can exceed a single SecureStore value's practical size.
// Commit a generation pointer only after every chunk has been saved; keep
// the old generation intact if a write fails. Never log token contents.
const CHUNK_SIZE = 1500;
type Manifest = { generation: string; chunks: number };
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const safeKey = (key: string) => key.replace(/[^a-zA-Z0-9._-]/g, '_');
async function manifest(key: string): Promise<Manifest | null> {
  const raw = await SecureStore.getItemAsync(`${key}.manifest`);
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (typeof value.generation !== 'string' || !Number.isInteger(value.chunks) || value.chunks < 0 || value.chunks > 100) throw new Error('Invalid session storage');
  return value;
}
async function removeChunks(key: string, value: Manifest | null) {
  if (!value) return;
  await Promise.all(Array.from({ length: value.chunks }, (_, i) => SecureStore.deleteItemAsync(`${key}.${value.generation}.${i}`).catch(() => {})));
}
export const sessionStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    if (Platform.OS === 'web') return AsyncStorage.getItem(rawKey);
    const key = safeKey(rawKey);
    const current = await manifest(key);
    if (current) {
      if (current.chunks === 0) return null;
      const parts = await Promise.all(Array.from({ length: current.chunks }, (_, i) => SecureStore.getItemAsync(`${key}.${current.generation}.${i}`)));
      if (parts.some((part) => part === null)) return null;
      return parts.join('');
    }
    const legacy = await AsyncStorage.getItem(rawKey);
    if (legacy) await sessionStorage.setItem(rawKey, legacy);
    return legacy;
  },
  async setItem(rawKey: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.setItem(rawKey, value);
    const key = safeKey(rawKey); const previous = await manifest(key);
    const next = { generation: `${Date.now()}-${Math.random().toString(36).slice(2)}`, chunks: Math.ceil(value.length / CHUNK_SIZE) };
    for (let i = 0; i < next.chunks; i++) await SecureStore.setItemAsync(`${key}.${next.generation}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), options);
    await SecureStore.setItemAsync(`${key}.manifest`, JSON.stringify(next), options);
    await AsyncStorage.removeItem(rawKey);
    await removeChunks(key, previous);
  },
  async removeItem(rawKey: string): Promise<void> {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(rawKey);
    const key = safeKey(rawKey); const previous = await manifest(key);
    // A tombstone prevents a failed legacy deletion from restoring a session.
    await SecureStore.setItemAsync(`${key}.manifest`, JSON.stringify({ generation: 'deleted', chunks: 0 }), options);
    await AsyncStorage.removeItem(rawKey);
    await removeChunks(key, previous);
  },
};
