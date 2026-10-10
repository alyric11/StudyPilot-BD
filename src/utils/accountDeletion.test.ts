import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { accountDeletionHandler, type AccountDeletionDependencies } from '../../server/accountDeletion';
import { deleteAccountBrowserData } from './deleteAccountBrowserData';
import { createStudentCloud } from '../cloud/studentCloud';

const token = { uid: 'student-a', email_verified: true, auth_time: 1000,
  firebase: { sign_in_provider: 'password' } } as DecodedIdToken;
async function attempt(options: { token?: DecodedIdToken; invalid?: boolean; missing?: boolean; enabled?: boolean; method?: string; confirmation?: string; failAt?: string } = {}) {
  const calls: string[] = [];
  const step = async (name: string, uid: string) => { calls.push(`${name}:${uid}`); if (options.failAt === name) throw Error('failure'); };
  const dependencies: AccountDeletionDependencies = {
    enabled: () => options.enabled !== false,
    verify: async () => { if (options.invalid) throw Error('invalid'); return options.token || token; },
    blockWrites: uid => step('block', uid), removeRecords: uid => step('records', uid), removeLogin: uid => step('login', uid), now: () => 1001000,
  };
  let status = 200; let result: any;
  await accountDeletionHandler(dependencies)({ method: options.method || 'DELETE', header: () => options.missing ? undefined : 'Bearer valid',
    body: { confirmation: options.confirmation ?? 'DELETE', uid: 'another-student' } } as unknown as Request,
  { setHeader: () => {}, status: (code: number) => { status = code; return { json: (value: unknown) => { result = value; } }; }, json: (value: unknown) => { result = value; } } as unknown as Response, () => {});
  return { status, result, calls };
}

test('deletion verifies recent password login and explicit confirmation before any writes', async () => {
  for (const options of [{ missing: true }, { invalid: true }, { enabled: false }, { confirmation: 'delete' },
    { token: { ...token, auth_time: 1 } }, { token: { ...token, email_verified: false } },
    { token: { ...token, auth_time: Number.NaN } },
    { token: { ...token, firebase: { ...token.firebase, sign_in_provider: 'custom' } } }]) {
    const result = await attempt(options);
    assert.ok(result.status >= 400); assert.deepEqual(result.calls, []);
  }
  const available = await attempt({ method: 'GET', enabled: false });
  assert.deepEqual(available.result, { enabled: false }); assert.deepEqual(available.calls, []);
});

test('deletion blocks old-device writes, removes only the authenticated UID records, then removes login', async () => {
  const result = await attempt();
  assert.equal(result.status, 200); assert.deepEqual(result.result, { deleted: true });
  assert.deepEqual(result.calls, ['block:student-a', 'records:student-a', 'login:student-a']);
});

test('partial deletion keeps login for retry and never proceeds if the write guard fails', async () => {
  const blocked = await attempt({ failAt: 'block' });
  assert.equal(blocked.status, 503); assert.deepEqual(blocked.calls, ['block:student-a']);
  const partial = await attempt({ failAt: 'records' });
  assert.equal(partial.status, 503); assert.deepEqual(partial.calls, ['block:student-a', 'records:student-a']);
  assert.match(partial.result.error, /Some records may already be removed/);
  assert.equal((await attempt()).status, 200);
});

function memoryStorage(): Storage {
  const entries = new Map<string, string>();
  return { get length() { return entries.size; }, key: index => [...entries.keys()][index] ?? null,
    getItem: key => entries.get(key) ?? null, setItem: (key, value) => { entries.set(key, value); }, removeItem: key => { entries.delete(key); }, clear: () => { entries.clear(); } };
}
test('browser cleanup removes own backups and navigation but preserves another account and unrelated data', () => {
  const local = memoryStorage(), session = memoryStorage();
  for (const [key, value] of [['studypilot:user:a:sp_profile', 'profile'], ['studypilot:user:a:__cloud_pending', 'queue'],
    ['studypilot:user:a:__browser_backup', 'backup'], ['studypilot:user:b:sp_profile', 'keep'],
    ['sp_profile', JSON.stringify({ email: 'someone-else@example.test' })], ['other-app', 'keep']]) local.setItem(key, value);
  session.setItem('sp_navigation_v1:a', 'remove'); session.setItem('sp_navigation_v1:b', 'keep');
  deleteAccountBrowserData(local, session, 'a', 'student@example.test');
  assert.equal(local.getItem('studypilot:user:a:__browser_backup'), null);
  assert.equal(local.getItem('studypilot:user:a:__cloud_pending'), null);
  assert.equal(local.getItem('studypilot:user:b:sp_profile'), 'keep');
  assert.notEqual(local.getItem('sp_profile'), null); assert.equal(local.getItem('other-app'), 'keep');
  assert.equal(session.getItem('sp_navigation_v1:a'), null); assert.equal(session.getItem('sp_navigation_v1:b'), 'keep');
  local.setItem('sp_profile', JSON.stringify({ email: 'student@example.test' })); local.setItem('sp_notes', 'remove');
  deleteAccountBrowserData(local, session, 'a', 'student@example.test');
  assert.equal(local.getItem('sp_profile'), null); assert.equal(local.getItem('sp_notes'), null);
});

test('deletion stops cloud edits and a reload cannot restart the saved queue', () => {
  const local = memoryStorage(); let listens = 0, writes = 0;
  const transport = { listen: () => { listens++; return () => {}; }, write: async () => { writes++; } };
  const cloud = createStudentCloud(local, 'student-a', transport);
  cloud.suspendForDeletion();
  assert.throws(() => cloud.storage.setItem('sp_profile', '{}'), /not ready/);
  const reloaded = createStudentCloud(local, 'student-a', transport);
  reloaded.start();
  assert.equal(reloaded.getState().phase, 'error'); assert.equal(listens, 0); assert.equal(writes, 0);
  reloaded.stop();
});
