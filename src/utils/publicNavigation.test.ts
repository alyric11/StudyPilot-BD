import test from 'node:test';
import assert from 'node:assert/strict';
import { accountDestination, publicPageFromPath, publicPaths } from './publicNavigation';

test('public URLs survive refresh and accept trailing slashes', () => {
  for (const [page, path] of Object.entries(publicPaths)) {
    assert.equal(publicPageFromPath(path), page);
    assert.equal(publicPageFromPath(`${path}/`), page);
  }
  assert.equal(publicPageFromPath('/unknown'), 'welcome');
});
test('remembered accounts do not hide welcome or bypass public account forms', () => {
  assert.equal(accountDestination('welcome', true, true), 'welcome');
  assert.equal(accountDestination('app', true, true), 'app');
  assert.equal(accountDestination('login', true, true), 'login');
  assert.equal(accountDestination('signup', true, true), 'signup');
  assert.equal(accountDestination('reset', true, true), 'reset');
});
test('signed-out and unverified visitors cannot bypass account checks', () => {
  assert.equal(accountDestination('app', false, false), 'login');
  assert.equal(accountDestination('signup', false, false), 'signup');
  assert.equal(accountDestination('reset', false, false), 'reset');
  assert.equal(accountDestination('app', false, true), 'verify');
  assert.equal(accountDestination('verify', false, true), 'verify');
  assert.equal(accountDestination('verify', true, true), 'app');
  assert.equal(accountDestination('verify', false, false), 'signup');
});
