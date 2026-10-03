import { validatePublishedVideos } from "../src/utils/chapterVideos";
import type { ChapterOverviewData } from "../src/types";

export function prepareSharedChapters(overviews: unknown, videos: unknown) {
  const isMap = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object" && !Array.isArray(value);
  if (!isMap(overviews) || !isMap(videos)) throw new Error("Shared content must be chapter maps.");
  return [...new Set([...Object.keys(overviews), ...Object.keys(videos)])].sort().map(key => {
    const parts = key.split(":");
    if (parts.length !== 2 || parts.some(part => !/^[\w-]{1,100}$/.test(part))) throw new Error(`Invalid chapter identity: ${key}`);
    const [subjectId, chapterId] = parts;
    const record: { subjectId: string; chapterId: string; overview?: ChapterOverviewData; videos?: ReturnType<typeof validatePublishedVideos>; schemaVersion: number } = { subjectId, chapterId, schemaVersion: 1 };
    if (Object.hasOwn(overviews, key)) {
      const value = overviews[key];
      if (!isMap(value) || typeof value.introduction !== "string" || !value.introduction.trim() ||
        !Array.isArray(value.importantTopics) || value.importantTopics.some(topic =>
          !isMap(topic) || typeof topic.topic !== "string" || typeof topic.description !== "string")) {
        throw new Error(`Invalid overview: ${key}`);
      }
      record.overview = { introduction: value.introduction, importantTopics: value.importantTopics.map(topic => ({ topic: topic.topic, description: topic.description })) };
    }
    if (Object.hasOwn(videos, key)) {
      validatePublishedVideos(videos[key]);
      // Preserve source text and metadata exactly; validation only checks it.
      record.videos = videos[key] as ReturnType<typeof validatePublishedVideos>;
    }
    if (Buffer.byteLength(JSON.stringify(record), "utf8") > 900000) throw new Error(`Chapter too large: ${key}`);
    return { id: `${subjectId}:${chapterId}`, record };
  });
}
