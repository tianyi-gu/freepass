// Read-only production checks. Never logs response bodies, credentials or user data.
import assert from 'node:assert/strict';

const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(base?.startsWith('https://') && key, 'Supabase URL and public anon key are required');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const results = [];
async function check(name, path, validate, options = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const started = Date.now();
    try {
      const response = await fetch(path.startsWith('https://') ? path : base + path, {
        headers: path.startsWith('https://') ? {} : headers,
        ...options, signal: AbortSignal.timeout(15000),
      });
      await validate(response);
      results.push({ name, status: 'pass', ms: Date.now() - started, attempt });
      return;
    } catch {
      if (attempt === 3) {
        results.push({ name, status: 'fail', ms: Date.now() - started, attempt });
        process.exitCode = 1;
      } else await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
}
await check('Auth available and email confirmation required', '/auth/v1/settings', async r => {
  assert.equal(r.status, 200);
  const settings = await r.json();
  assert.equal(settings.mailer_autoconfirm, false);
  assert.equal(settings.external?.email, true);
});
await check('Published directory readable', '/rest/v1/resources?select=id&is_published=eq.true&limit=1', async r => {
  assert.equal(r.status, 200);
  const rows = await r.json();
  assert.ok(Array.isArray(rows) && rows.length === 1 && typeof rows[0].id === 'string');
});
await check('Published learning readable', '/rest/v1/courses?select=id&in_learning_academy=eq.true&is_hidden=eq.false&limit=1', async r => {
  assert.equal(r.status, 200);
  assert.equal((await r.json()).length, 1);
});
await check('Casey enforces current consent', '/functions/v1/casey', async r => {
  assert.equal(r.status, 403);
  assert.equal((await r.json()).error, 'consent_required');
}, { method: 'POST', body: JSON.stringify({ action: 'chat', consentVersion: 1, message: 'Health check' }) });
await check('Privacy policy available with current providers', 'https://freepass-privacy.vercel.app', async r => {
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('OpenAI') && html.includes('Gmail'));
});
// One synthetic provider call daily or when explicitly requested; no customer input.
if (process.env.CHECK_CASEY_MODEL === 'true') {
  await check('Live Casey directory routing', '/functions/v1/casey', async r => {
    assert.equal(r.status, 200);
    const reply = await r.json();
    assert.equal(reply.kind, 'recommend');
    assert.ok(typeof reply.reply === 'string' && Array.isArray(reply.resourceIds) && reply.resourceIds.length > 0);
    const ids = reply.resourceIds;
    assert.ok(ids.length <= 3 && ids.every(id => /^[0-9a-f-]{36}$/i.test(id)));
    const records = await fetch(base + '/rest/v1/resources?select=id&is_published=eq.true&id=in.(' + ids.join(',') + ')', { headers, signal: AbortSignal.timeout(15000) });
    assert.equal(records.status, 200);
    assert.equal((await records.json()).length, ids.length);
  }, { method: 'POST', body: JSON.stringify({ action: 'chat', consentVersion: 2, message: 'Where can I find housing support in Philadelphia?', history: [] }) });
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
