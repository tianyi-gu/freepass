type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export function createNativeSessionStorage(secure: Storage, legacy: Storage): Storage {
  // Supabase sessions can exceed a single SecureStore value's practical size.
  // Commit a generation pointer only after every chunk has been saved; keep
  // the old generation intact if a write fails. Never log token contents.
  const CHUNK_SIZE = 1500;
  type Manifest = { generation: string; chunks: number };
  const safeKey = (key: string) => key.replace(/[^a-zA-Z0-9._-]/g, '_');
  async function manifest(key: string): Promise<Manifest | null> {
    const raw = await secure.getItem(`${key}.manifest`);
    if (raw === null) return null;
    try {
      const value = JSON.parse(raw);
      if (value && typeof value.generation === 'string' && /^[a-zA-Z0-9._-]+$/.test(value.generation)
        && Number.isInteger(value.chunks) && value.chunks >= 0 && value.chunks <= 100) return value;
    } catch { /* Discard an unreadable pointer so sign-in can repair storage. */ }
    await secure.removeItem(`${key}.manifest`);
    return null;
  }
  async function removeChunks(key: string, value: Manifest | null) {
    if (!value) return;
    await Promise.all(Array.from({ length: value.chunks }, (_, i) => secure.removeItem(`${key}.${value.generation}.${i}`).catch(() => {})));
  }
  const sessionStorage: Storage = {
    async getItem(rawKey: string): Promise<string | null> {
      const key = safeKey(rawKey);
      const current = await manifest(key);
      if (current) {
        if (current.chunks === 0) return null;
        const parts = await Promise.all(Array.from({ length: current.chunks }, (_, i) => secure.getItem(`${key}.${current.generation}.${i}`)));
        if (parts.some((part) => part === null)) return null;
        return parts.join('');
      }
      const value = await legacy.getItem(rawKey);
      if (value) await sessionStorage.setItem(rawKey, value);
      return value;
    },
    async setItem(rawKey: string, value: string): Promise<void> {
      const key = safeKey(rawKey); const previous = await manifest(key);
      const next = { generation: `${Date.now()}-${Math.random().toString(36).slice(2)}`, chunks: Math.ceil(value.length / CHUNK_SIZE) };
      if (next.chunks > 100) throw new Error('Session exceeds secure storage limit');
      for (let i = 0; i < next.chunks; i++) await secure.setItem(`${key}.${next.generation}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      await secure.setItem(`${key}.manifest`, JSON.stringify(next));
      await legacy.removeItem(rawKey);
      await removeChunks(key, previous);
    },
    async removeItem(rawKey: string): Promise<void> {
      const key = safeKey(rawKey); const previous = await manifest(key);
      // A tombstone prevents a failed legacy deletion from restoring a session.
      await secure.setItem(`${key}.manifest`, JSON.stringify({ generation: 'deleted', chunks: 0 }));
      await legacy.removeItem(rawKey);
      await removeChunks(key, previous);
    },
  };
  return sessionStorage;
}
