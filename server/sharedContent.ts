import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "./firebaseAdmin";
import type { ChapterOverviewData } from "../src/types";
import type { ChapterVideo } from "../src/utils/chapterVideos";

type Content = { overview?: ChapterOverviewData; videos?: ChapterVideo[] };
export function chapterKey(subject: unknown, chapter: unknown) {
  if (typeof subject !== "string" || typeof chapter !== "string" ||
    !/^[\w-]{1,100}$/.test(subject) || !/^[\w-]{1,100}$/.test(chapter)) throw new Error("Invalid chapter identity.");
  return `${subject}:${chapter}`;
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
  async id => (await getServerFirestore().collection("sharedChapters").doc(id).get()).data() || {},
  async (id, fields) => {
    const [subjectId, chapterId] = id.split(":");
    // Merge only the supplied top-level field, so video saves cannot replace an overview.
    await getServerFirestore().collection("sharedChapters").doc(id).set(
      { ...fields, subjectId, chapterId, schemaVersion: 1, updatedAt: FieldValue.serverTimestamp() },
      { mergeFields: [...Object.keys(fields), "subjectId", "chapterId", "schemaVersion", "updatedAt"] },
    );
  },
);
