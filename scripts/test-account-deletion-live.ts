import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import express from 'express';
import type { Server } from 'node:http';
import { getServerAuth, getServerFirestore } from '../server/firebaseAdmin';
import { accountDeletionHandler } from '../server/accountDeletion';

// Creates only disposable accounts. Never accepts a student's UID or credentials.
if (!process.argv.includes('--disposable')) throw new Error('Use --disposable for the authorized test workflow.');
const timeout = setTimeout(() => { console.error('Disposable test timed out. Inspect test-only cleanup before retrying.'); process.exit(1); }, 120000);
const created: string[] = [];
let server: Server | undefined;
const db = getServerFirestore(), admin = getServerAuth();
try {
  const urlIndex = process.argv.indexOf('--url');
  let base = urlIndex >= 0 ? process.argv[urlIndex + 1] : '';
  if (base && !['https://studypilot-bd.onrender.com', 'http://127.0.0.1:3000', 'http://localhost:3000'].includes(base))
    throw new Error('Unexpected test destination.');
  if (!base) {
    const app = express(); app.use(express.json());
    app.get('/api/account-deletion', accountDeletionHandler()); app.delete('/api/account-deletion', accountDeletionHandler());
    server = await new Promise<Server>(resolve => { const listener = app.listen(0, '127.0.0.1', () => resolve(listener)); });
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  }
  const password = randomBytes(24).toString('base64url') + '!aA1';
  for (let i = 0; i < 2; i++) {
    const user = await admin.createUser({ email: `deletion-check-${randomBytes(12).toString('hex')}@example.test`, password, emailVerified: true });
    created.push(user.uid);
  }
  const [target, control] = created;
  const user = await admin.getUser(target);
  const source = await readFile('src/config/firebase.ts', 'utf8');
  const key = source.match(/apiKey:\s*"([^"]+)"/)?.[1]; assert.ok(key);
  const login = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password, returnSecureToken: true }), signal: AbortSignal.timeout(20000),
  });
  assert.equal(login.status, 200, 'Disposable login failed');
  const token = (await login.json()).idToken;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const root = `https://firestore.googleapis.com/v1/projects/studypilot-bd-test/databases/(default)/documents`;
  const normalWrite = await fetch(`${root}/users/${target}/records/deletion-probe`, {
    method: 'PATCH', headers, body: JSON.stringify({ fields: { testOnly: { booleanValue: true } } }), signal: AbortSignal.timeout(20000),
  });
  assert.equal(normalWrite.status, 200, 'Normal student saving must work with published rules');
  await db.doc(`users/${target}/records/deletion-probe/nested/test`).set({ disposable: true });
  await db.doc(`users/${control}/records/control`).set({ disposable: true });
  const available = await fetch(`${base}/api/account-deletion`, { headers, signal: AbortSignal.timeout(60000) });
  assert.equal(available.status, 200, 'Deletion availability endpoint failed');
  assert.equal((await available.json()).enabled, true, 'Deletion must be activated');
  const rejected = await fetch(`${base}/api/account-deletion`, { method: 'DELETE', headers, body: JSON.stringify({ confirmation: 'wrong', uid: control }), signal: AbortSignal.timeout(30000) });
  assert.equal(rejected.status, 400, 'Missing confirmation must not delete records');
  assert.equal((await db.doc(`users/${target}/records/deletion-probe`).get()).exists, true);
  const removed = await fetch(`${base}/api/account-deletion`, { method: 'DELETE', headers, body: JSON.stringify({ confirmation: 'DELETE', uid: control }), signal: AbortSignal.timeout(45000) });
  assert.equal(removed.status, 200, 'Account deletion request failed');
  assert.equal((await removed.json()).deleted, true);
  await assert.rejects(admin.getUser(target), (error: { code?: string }) => error.code === 'auth/user-not-found');
  assert.equal((await db.doc(`users/${target}/records/deletion-probe`).get()).exists, false);
  assert.equal((await db.doc(`users/${target}/records/deletion-probe/nested/test`).get()).exists, false);
  assert.equal((await db.doc(`users/${control}/records/control`).get()).exists, true, 'Another account must be preserved');
  const staleWrite = await fetch(`${root}/users/${target}/records/reappearing`, {
    method: 'PATCH', headers, body: JSON.stringify({ fields: { testOnly: { booleanValue: true } } }), signal: AbortSignal.timeout(20000),
  });
  assert.ok([401, 403].includes(staleWrite.status), 'Old devices must not restore deleted records');
  console.log('Verified: normal saving, confirmation, authenticated account isolation, recursive cleanup, login deletion, and blocked stale-device writes. Only disposable accounts used.');
} catch (error) {
  console.error(error instanceof assert.AssertionError ? error.message : 'Disposable test failed. Credentials and tokens were not logged.');
  process.exitCode = 1;
} finally {
  for (const uid of created) {
    try {
      await db.collection('accountDeletions').doc(uid).set({ testOnly: true });
      await db.recursiveDelete(db.collection('users').doc(uid));
      try { await admin.deleteUser(uid); } catch (error) { if ((error as { code?: string }).code !== 'auth/user-not-found') throw error; }
    } catch { console.error('Disposable cleanup needs attention. No real student account was involved.'); process.exitCode = 1; }
  }
  server?.close(); clearTimeout(timeout);
}
