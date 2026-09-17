import assert from 'node:assert/strict';
import test from 'node:test';
import { CaseyRequestError, readCaseyResponse } from '../lib/casey-response';

test('gateway HTML, empty and invalid success bodies produce controlled errors', async () => {
  for (const [body, status] of [['<html>Unavailable</html>', 503], ['', 502], ['', 200], ['null', 200], ['[]', 200]] as const) {
    await assert.rejects(readCaseyResponse(new Response(body, { status })),
      (error) => error instanceof CaseyRequestError && error.code === 'temporarily_unavailable');
  }
});

test('gateway rate limiting and handled errors preserve their user-facing codes', async () => {
  for (const [body, status, code] of [['', 429, 'busy'], ['{"error":"consent_required"}', 403, 'consent_required'], ['{"error":"busy"}', 429, 'busy']] as const) {
    await assert.rejects(readCaseyResponse(new Response(body, { status })),
      (error) => error instanceof CaseyRequestError && error.code === code);
  }
});

test('valid Casey responses pass through unchanged', async () => {
  assert.deepEqual(await readCaseyResponse(Response.json({ reply: 'Directory result', resourceIds: ['published'] })),
    { reply: 'Directory result', resourceIds: ['published'] });
});
