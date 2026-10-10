import type { RequestHandler } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { readFile } from 'node:fs/promises';
import { getServerAuth, getServerFirestore } from './firebaseAdmin';

let rulesCheck: { until: number; result: Promise<boolean> } | undefined;
async function deletionEnabled() {
  if (process.env.ACCOUNT_DELETION_RULES_READY === 'false') return false;
  if (rulesCheck && rulesCheck.until > Date.now()) return rulesCheck.result;
  const result = (async () => {
    try {
      const [rules, expected] = await Promise.all([
        getSecurityRules(getServerAuth().app).getFirestoreRuleset(), readFile('firestore.rules', 'utf8'),
      ]);
      const normalize = (text: string) => text.replace(/\r\n/g, '\n').trim();
      return rules.source.length === 1 && normalize(rules.source[0].content) === normalize(expected);
    } catch { return false; }
  })();
  rulesCheck = { until: Date.now() + 60000, result };
  return result;
}

export interface AccountDeletionDependencies {
  enabled: () => boolean | Promise<boolean>;
  verify: (token: string) => Promise<DecodedIdToken>;
  blockWrites: (uid: string) => Promise<void>;
  removeRecords: (uid: string) => Promise<void>;
  removeLogin: (uid: string) => Promise<void>;
  now: () => number;
}
const dependencies: AccountDeletionDependencies = {
  // Fail closed unless published rules exactly match the reviewed local rules.
  enabled: deletionEnabled,
  verify: token => getServerAuth().verifyIdToken(token, true),
  blockWrites: async uid => {
    await getServerFirestore().collection('accountDeletions').doc(uid).set({ requestedAt: FieldValue.serverTimestamp() });
  },
  removeRecords: async uid => { await getServerFirestore().recursiveDelete(getServerFirestore().collection('users').doc(uid)); },
  removeLogin: async uid => {
    try { await getServerAuth().deleteUser(uid); }
    catch (error) { if ((error as { code?: string }).code !== 'auth/user-not-found') throw error; }
  },
  now: Date.now,
};

export function accountDeletionHandler(services = dependencies): RequestHandler {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const match = req.header('authorization')?.match(/^Bearer (\S+)$/);
    if (!match) { res.status(401).json({ error: 'Please sign in again.' }); return; }
    let token: DecodedIdToken;
    try { token = await services.verify(match[1]); }
    catch { res.status(401).json({ error: 'Please sign in again to delete your account.' }); return; }
    if (!token.uid || token.uid.includes('/')) { res.status(401).json({ error: 'Please sign in again.' }); return; }
    if (req.method === 'GET') {
      res.json({ enabled: await services.enabled() }); return;
    }
    if (!await services.enabled()) {
      res.status(503).json({ error: 'Account deletion is being prepared. Please contact the project owner for help deleting your account.' }); return;
    }
    const age = services.now() / 1000 - token.auth_time;
    if (token.email_verified !== true || token.firebase?.sign_in_provider !== 'password' || !Number.isFinite(age) || age < -60 || age > 300) {
      res.status(403).json({ error: 'Enter your current password again before deleting your account.' }); return;
    }
    if (req.body?.confirmation !== 'DELETE') {
      res.status(400).json({ error: 'Type DELETE to confirm account deletion.' }); return;
    }
    try {
      // UID comes exclusively from the verified token, never from the request body.
      // The minimal marker prevents old tokens/offline devices from recreating records.
      await services.blockWrites(token.uid);
      await services.removeRecords(token.uid);
      // Keep the login available for a password-verified retry if record cleanup fails.
      await services.removeLogin(token.uid);
      res.json({ deleted: true });
    } catch {
      res.status(503).json({ error: 'Deletion could not be completed. Some records may already be removed. Please retry account deletion; ordinary cloud saving stays paused.' });
    }
  };
}
