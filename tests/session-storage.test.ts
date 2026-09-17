import assert from 'node:assert/strict';
import test from 'node:test';
import { createNativeSessionStorage } from '../lib/session-storage-core';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    async getItem(key: string) { return data.get(key) ?? null; },
    async setItem(key: string, value: string) { data.set(key, value); },
    async removeItem(key: string) { data.delete(key); },
  };
}

test('corrupt session pointers allow a fresh sign-in and sign-out', async () => {
  for (const broken of ['', '{bad', 'null', '[]', '{"generation":"x","chunks":101}', '{"generation":"../x","chunks":1}']) {
    const secure = memoryStorage(); const legacy = memoryStorage();
    const storage = createNativeSessionStorage(secure, legacy);
    secure.data.set('session.manifest', broken);
    assert.equal(await storage.getItem('session'), null);
    assert.equal(secure.data.has('session.manifest'), false);
    secure.data.set('session.manifest', broken);
    await storage.setItem('session', 'new session');
    assert.equal(await storage.getItem('session'), 'new session');
    secure.data.set('session.manifest', broken);
    await storage.removeItem('session');
    assert.equal(await storage.getItem('session'), null);
  }
});

test('legacy sessions migrate and oversized sessions round-trip through chunks', async () => {
  const secure = memoryStorage(); const legacy = memoryStorage();
  const storage = createNativeSessionStorage(secure, legacy);
  const session = 'session-data-'.repeat(600);
  legacy.data.set('session', session);
  assert.equal(await storage.getItem('session'), session);
  assert.equal(legacy.data.has('session'), false);
  assert.equal(await storage.getItem('session'), session);
  await storage.removeItem('session');
  assert.equal(await storage.getItem('session'), null);
  assert.equal(secure.data.size, 1); // Only the signed-out tombstone remains.
});

test('failed chunk writes preserve the previous usable session', async () => {
  const secure = memoryStorage(); const legacy = memoryStorage();
  const storage = createNativeSessionStorage(secure, legacy);
  await storage.setItem('session', 'previous');
  const originalWrite = secure.setItem;
  secure.setItem = async (key, value) => {
    if (key.endsWith('.1')) throw new Error('Keychain write interrupted');
    await originalWrite(key, value);
  };
  await assert.rejects(storage.setItem('session', 'replacement'.repeat(300)), /interrupted/);
  assert.equal(await storage.getItem('session'), 'previous');
});

test('logout tombstone prevents legacy resurrection when legacy removal fails', async () => {
  const secure = memoryStorage(); const legacy = memoryStorage();
  const storage = createNativeSessionStorage(secure, legacy);
  await storage.setItem('session', 'current');
  legacy.data.set('session', 'stale');
  legacy.removeItem = async () => { throw new Error('Storage unavailable'); };
  await assert.rejects(storage.removeItem('session'), /unavailable/);
  assert.equal(await storage.getItem('session'), null);
});

test('missing chunks never return partial authentication data', async () => {
  const secure = memoryStorage(); const legacy = memoryStorage();
  const storage = createNativeSessionStorage(secure, legacy);
  await storage.setItem('session', 'session-data'.repeat(300));
  const chunk = [...secure.data.keys()].find((key) => key.endsWith('.1'))!;
  secure.data.delete(chunk);
  assert.equal(await storage.getItem('session'), null);
  await storage.setItem('session', 'repaired');
  assert.equal(await storage.getItem('session'), 'repaired');
});
