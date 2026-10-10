import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { getServerAuth } from '../server/firebaseAdmin';

if (!process.argv.includes('--publish')) throw new Error('Use --publish only with owner authorization.');
const timeout = setTimeout(() => { console.error('Activation timed out. Verify published rules before retrying.'); process.exit(1); }, 45000);
try {
  const service = getSecurityRules(getServerAuth().app);
  const current = await service.getFirestoreRuleset();
  const expected = await readFile('firestore.rules', 'utf8');
  const previous = execFileSync('git', ['show', 'HEAD:firestore.rules'], { encoding: 'utf8' });
  const normalize = (text: string) => text.replace(/\r\n/g, '\n').trim();
  if (current.source.length !== 1 || ![previous, expected].some(source => normalize(source) === normalize(current.source[0].content)))
    throw new Error('Published rules differ from the reviewed baseline. Stopped to preserve unrelated rules.');
  await mkdir('.secrets', { recursive: true });
  try { await writeFile('.secrets/firestore-rules-before-account-deletion.json', JSON.stringify({ name: current.name, source: current.source }, null, 2), { flag: 'wx' }); }
  catch (error) { if ((error as { code?: string }).code !== 'EEXIST') throw error; }
  if (normalize(current.source[0].content) !== normalize(expected)) await service.releaseFirestoreRulesetFromSource(expected);
  const verified = await service.getFirestoreRuleset();
  if (verified.source.length !== 1 || normalize(verified.source[0].content) !== normalize(expected)) throw new Error('Published rules verification failed.');
  const env = await readFile('.env', 'utf8');
  const line = 'ACCOUNT_DELETION_RULES_READY="true"';
  await writeFile('.env', /^ACCOUNT_DELETION_RULES_READY\s*=.*$/m.test(env) ? env.replace(/^ACCOUNT_DELETION_RULES_READY\s*=.*$/m, line) : `${env.trimEnd()}\n\n${line}\n`);
  console.log('Published protection verified. Local deletion activated. Previous rules preserved in the ignored .secrets folder. No student data changed.');
} catch (error) {
  console.error(error instanceof Error && /reviewed baseline|verification failed/.test(error.message) ? error.message : 'Activation failed. Check Firebase Rules permissions and connectivity. No account was deleted.');
  process.exitCode = 1;
} finally { clearTimeout(timeout); }
