import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "./firebaseAdmin";
import type { ChapterOverviewData } from "../src/types";
import type { ChapterVideo } from "../src/utils/chapterVideos";
import { sharedChapterIdentity } from "../src/utils/sharedChapterIdentity";
import { mergeSharedOverviews, mergeSharedLibraries } from "./sharedChapterMerge";
import { seedVideoLibrary } from "../src/utils/videoLibrary";

type Content = { overview?: ChapterOverviewData; videos?: ChapterVideo[] };
export function chapterKey(subject: unknown, chapter: unknown) {
  if (typeof subject !== "string" || typeof chapter !== "string" ||
    !/^[\w-]{1,100}$/.test(subject) || !/^[\w-]{1,100}$/.test(chapter)) throw new Error("Invalid chapter identity.");
  return sharedChapterIdentity(subject, chapter).key;
}
export function createSharedContentStore(read: (id: string) => Promise<Content>, write: (id: string, fields: Content) => Promise<void>, now = Date.now) {
  const cache = new Map<string, { until: number; value: Promise<Content> }>();
  return {
    read: (id: string) => {
      const cached = cache.get(id);
      if (cached && cached.until > now()) return cached.value;
      const entry = { until: now() + 30000, value: Promise.resolve({}) as Promise<Content> };
      entry.value = read(id).catch(error => { if (cache.get(id) === entry) cache.delete(id); throw error; });
      if (cache.size >= 500) cache.delete(cache.keys().next().value!);
      cache.set(id, entry);
      return entry.value;
    },
    write: async (id: string, fields: Content) => {
      await write(id, fields);
      cache.delete(id);
    },
  };
}
export const sharedContent = createSharedContentStore(
  async id => {
    const collection = getServerFirestore().collection("sharedChapters");
    const saved = (await collection.doc(id).get()).data() || {};
    const [subject, chapter] = id.split(':');
    const { legacyKeys } = sharedChapterIdentity(subject, chapter);
    if (!legacyKeys.length || (saved.overview !== undefined && saved.videos !== undefined)) return saved;
    const originals = await Promise.all(legacyKeys.map(async key => (await collection.doc(key).get()).data() || {}));
    const overview = saved.overview ?? mergeSharedOverviews(originals);
    // The old five-video endpoint remains compatible; the full pool is handled separately.
    const videos = saved.videos ?? (() => {
      const merged = mergeSharedLibraries(originals.map(record => seedVideoLibrary(record.videos || [])), id);
      return merged.featuredIds.map(videoId => originals.flatMap(record => record.videos || []).find(video => video.videoId === videoId)!);
    })();
    return { ...(overview ? { overview } : {}), videos };
  },
  async (id, fields) => {
    const [subjectId, chapterId] = id.split(":");
    const { legacyKeys } = sharedChapterIdentity(subjectId, chapterId);
    const db = getServerFirestore(), ref = db.collection('sharedChapters').doc(id);
    if (legacyKeys.length) {
      await db.runTransaction(async transaction => {
        const saved = (await transaction.get(ref)).data() || {};
        const originals = await Promise.all(legacyKeys.map(async key => (await transaction.get(db.collection('sharedChapters').doc(key))).data() || {}));
        // Refuse to replace conflicting originals, including on the first publish.
        if (fields.overview && saved.overview === undefined) mergeSharedOverviews(originals);
        if (fields.videos && saved.videos === undefined) mergeSharedLibraries(originals.map(record => seedVideoLibrary(record.videos || [])), id);
        transaction.set(ref, { ...fields, subjectId, chapterId, schemaVersion: 1,
          sharedClasses: ['Class 11', 'Class 12'], sharedFrom: legacyKeys, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      });
      return;
    }
    // Merge only the supplied top-level field, so video saves cannot replace an overview.
    await getServerFirestore().collection("sharedChapters").doc(id).set(
      { ...fields, subjectId, chapterId, schemaVersion: 1, updatedAt: FieldValue.serverTimestamp() },
      { mergeFields: [...Object.keys(fields), "subjectId", "chapterId", "schemaVersion", "updatedAt"] },
    );
  },
);

// Overview reads must not be blocked by an unrelated featured-video conflict.
export const sharedOverviews = createSharedContentStore(async id => {
  const collection = getServerFirestore().collection('sharedChapters');
  const saved = (await collection.doc(id).get()).data();
  if (saved?.overview !== undefined) return { overview: saved.overview };
  const [subject, chapter] = id.split(':');
  const { legacyKeys } = sharedChapterIdentity(subject, chapter);
  const originals = await Promise.all(legacyKeys.map(async key => (await collection.doc(key).get()).data() || {}));
  const overview = mergeSharedOverviews(originals);
  return overview ? { overview } : {};
}, (id, fields) => sharedContent.write(id, fields));
