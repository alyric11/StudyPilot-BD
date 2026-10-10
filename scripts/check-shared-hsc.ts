import 'dotenv/config';
import { getServerFirestore } from '../server/firebaseAdmin';
import { sharedHscChapterPairs } from '../src/data/sharedHscChapters';
import { sharedChapterIdentity } from '../src/utils/sharedChapterIdentity';
import { legacyLibraries, mergeSharedLibraries, mergeSharedOverviews } from '../server/sharedChapterMerge';

// Read-only preflight. Never prints credentials, overview text, or student records.
const timeout = setTimeout(() => { console.error('Shared HSC check timed out. No data changed.'); process.exit(1); }, 45000);
try {
  const db = getServerFirestore();
  const [contents, libraries] = await Promise.all([
    db.collection('sharedChapters').select('overview', 'videos').get(),
    db.collection('chapterVideoLibraries').select('library').get(),
  ]);
  const contentById = new Map(contents.docs.map(doc => [doc.id, doc.data()]));
  const libraryById = new Map(libraries.docs.map(doc => [doc.id, doc.data().library]));
  const conflicts: { key: string; field: string }[] = [];
  let populated = 0;
  for (const [subject, chapter] of sharedHscChapterPairs) {
    const { key, legacyKeys } = sharedChapterIdentity(subject, chapter);
    const originals = legacyKeys.map(id => contentById.get(id) || {});
    if (legacyKeys.some(id => contentById.has(id) || libraryById.has(id))) populated++;
    if (!contentById.get(key)?.overview) {
      try { mergeSharedOverviews(originals); }
      catch { conflicts.push({ key, field: 'overview' }); }
    }
    if (!libraryById.has(key)) {
      try { mergeSharedLibraries(legacyLibraries(originals, legacyKeys.map(id => libraryById.get(id))), key); }
      catch { conflicts.push({ key, field: 'featured videos' }); }
    }
  }
  console.log(JSON.stringify({ pairs: sharedHscChapterPairs.length, populatedPairs: populated, conflicts, changed: false }, null, 2));
  if (conflicts.length) process.exitCode = 2;
} catch {
  console.error('Could not inspect saved HSC content. Check Firebase server credentials and connectivity. No data changed.');
  process.exitCode = 1;
} finally { clearTimeout(timeout); }
