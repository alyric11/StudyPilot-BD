import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { getServerAuth } from '../server/firebaseAdmin';

// Read-only: compare published rules with the reviewed local file; never print credentials.
const timeout = setTimeout(() => { console.error('Rules check timed out. No changes made.'); process.exit(1); }, 20000);
try {
  const deployed = await getSecurityRules(getServerAuth().app).getFirestoreRuleset();
  const expected = await readFile('firestore.rules', 'utf8');
  const normalize = (text: string) => text.replace(/\r\n/g, '\n').trim();
  const matches = deployed.source.length === 1 && normalize(deployed.source[0].content) === normalize(expected);
  const hasDeletionGuard = deployed.source.some(file => file.content.includes('!exists(/databases/$(database)/documents/accountDeletions/$(userId))'));
  console.log(JSON.stringify({ deletionEnabledLocally: process.env.ACCOUNT_DELETION_RULES_READY === 'true', publishedRulesMatchPreparedRules: matches, hasDeletionGuard, changed: false }));
  if (!matches) process.exitCode = 2;
} catch {
  console.error('Published rules could not be checked. Check Rules API access and server credentials. No changes made.');
  process.exitCode = 1;
} finally { clearTimeout(timeout); }
