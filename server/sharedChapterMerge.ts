import type { ChapterOverviewData } from '../src/types';
import type { ChapterVideo } from '../src/utils/chapterVideos';
import { seedVideoLibrary, type VideoLibrary } from '../src/utils/videoLibrary';

export type SharedChapterContent = { overview?: ChapterOverviewData; videos?: ChapterVideo[] };
export class SharedChapterConflict extends Error {
  constructor(kind: string) {
    super(`Classes 11 and 12 have different ${kind} saved for this chapter. Both originals are preserved. Review them before sharing this chapter.`);
  }
}

export function mergeSharedOverviews(records: SharedChapterContent[]): ChapterOverviewData | undefined {
  const values = records.flatMap(record => record.overview ? [record.overview] : []);
  const signature = (overview: ChapterOverviewData) => JSON.stringify([overview.introduction,
    overview.importantTopics.map(topic => [topic.topic, topic.description])]);
  if (values.some(value => signature(value) !== signature(values[0]))) throw new SharedChapterConflict('overviews');
  return values[0];
}

// Explicit owner decisions for the two conflicts found in the initial preflight.
// Applies only while reading originals; an existing shared library always takes precedence.
const featuredSourceByChapter: Readonly<Record<string, number>> = {
  'physics2:hsc-v1-p2_ch3': 0, // Class 11
  'physics2:hsc-v1-p2_ch8': 0, // Class 11
};

export function mergeSharedLibraries(libraries: VideoLibrary[], chapterKey?: string): VideoLibrary {
  const featured = libraries.filter(library => library.featuredIds.length);
  const preferredIndex = chapterKey === undefined ? undefined : featuredSourceByChapter[chapterKey];
  const preferred = preferredIndex === undefined ? undefined : libraries[preferredIndex];
  if (!preferred && featured.some(library => JSON.stringify(library.featuredIds) !== JSON.stringify(featured[0].featuredIds)))
    throw new SharedChapterConflict('featured video selections');
  const entries = new Map<string, VideoLibrary['entries'][number]>();
  for (const library of libraries) for (const entry of library.entries) {
    const previous = entries.get(entry.videoId);
    // Retain a deliberate approval and its reason when deduplicating the same video.
    entries.set(entry.videoId, previous ? { ...previous, approved: previous.approved || entry.approved,
      reviewReason: previous.approved || entry.approved ? '' : previous.reviewReason || entry.reviewReason,
      addedAt: Math.min(previous.addedAt, entry.addedAt) } : { ...entry });
  }
  return { entries: [...entries.values()], featuredIds: [...(preferred?.featuredIds ?? featured[0]?.featuredIds ?? [])],
    revision: Math.max(0, ...libraries.map(library => library.revision)) };
}

export function legacyLibraries(contents: SharedChapterContent[], libraries: (VideoLibrary | undefined)[]) {
  return contents.map((content, i) => libraries[i] || seedVideoLibrary(content.videos || []));
}
