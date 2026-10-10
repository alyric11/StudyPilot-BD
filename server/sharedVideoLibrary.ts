import type { Transaction } from 'firebase-admin/firestore';
import type { VideoLibrary } from '../src/utils/videoLibrary';
import { seedVideoLibrary } from '../src/utils/videoLibrary';
import { sharedChapterIdentity } from '../src/utils/sharedChapterIdentity';
import { getServerFirestore } from './firebaseAdmin';
import { legacyLibraries, mergeSharedLibraries, type SharedChapterContent } from './sharedChapterMerge';

/** Read-only fallback until the first edit creates the common record. Originals are never changed. */
export async function readSharedVideoLibrary(key: string, transaction?: Transaction, db = getServerFirestore()): Promise<VideoLibrary> {
  const read = async (collection: string, id: string) => {
    const ref = db.collection(collection).doc(id);
    return (transaction ? await transaction.get(ref) : await ref.get()).data();
  };
  const saved = await read('chapterVideoLibraries', key);
  if (saved?.library) return saved.library;
  const [subject, chapter] = key.split(':');
  const { legacyKeys } = sharedChapterIdentity(subject, chapter);
  if (!legacyKeys.length) return seedVideoLibrary((await read('sharedChapters', key))?.videos || []);
  const contents = await Promise.all(legacyKeys.map(id => read('sharedChapters', id))) as SharedChapterContent[];
  const libraries = await Promise.all(legacyKeys.map(async id => (await read('chapterVideoLibraries', id))?.library as VideoLibrary | undefined));
  return mergeSharedLibraries(legacyLibraries(contents.map(content => content || {}), libraries), key);
}
