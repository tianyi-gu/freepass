import assert from 'node:assert/strict';
import test from 'node:test';
import { withTimeout, TimeoutError, friendlyErrorMessage } from '../lib/network';

test('a session operation that never settles releases the UI with a retryable timeout', async () => {
  await assert.rejects(withTimeout(new Promise<never>(() => {}), 15), TimeoutError);
  assert.match(friendlyErrorMessage(new TimeoutError()), /try again/i);
});

test('session deadlines preserve successful results and credential errors', async () => {
  assert.equal(await withTimeout(Promise.resolve('session'), 100), 'session');
  const error = new Error('Invalid login credentials');
  await assert.rejects(withTimeout(Promise.reject(error), 100), (actual) => actual === error);
  assert.match(friendlyErrorMessage(error), /don't match/i);
});
