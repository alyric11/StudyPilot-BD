import type { ChapterVideo } from './chapterVideos.ts';
import type { SearchVideo } from './videoSearch.ts';

export interface LibraryEntry { videoId: string; approved: boolean; reviewReason: string; addedAt: number }
// Preserve saved review decisions so the requirement can be restored without migrating student data.
export const VIDEO_APPROVAL_REQUIRED = false;
export const videoApprovalAllows = (entry: Pick<LibraryEntry, 'approved'>) => !VIDEO_APPROVAL_REQUIRED || entry.approved;
export interface VideoLibrary { entries: LibraryEntry[]; featuredIds: string[]; revision: number }
export type LibraryVideo = ChapterVideo & { approved: boolean; reviewReason: string };
export type LibraryAction = { type: 'save'; videos: SearchVideo[] } | { type: 'feature' | 'unfeature' | 'approve' | 'remove'; videoId: string };
export function seedVideoLibrary(legacy: ChapterVideo[]): VideoLibrary {
  const ids = [...new Set(legacy.map(v => v.videoId).filter(id => /^[\w-]{11}$/.test(id)))].slice(0, 5);
  return { entries: ids.map(videoId => ({ videoId, approved: true, reviewReason: '', addedAt: 0 })), featuredIds: ids, revision: 0 };
}
/** Fill preserves editorial choices; replace is an explicit administrator action. */
export function selectFeaturedVideos(library: VideoLibrary, details: ChapterVideo[], replace = false): string[] {
  const byId = new Map(details.map(video => [video.videoId, video]));
  const selected = replace ? [] : [...library.featuredIds];
  if (selected.length >= 5) return selected;
  // Unknown channels on preserved choices make uniqueness impossible to establish.
  if (selected.some(id => !byId.get(id)?.channelId)) return selected;
  const channels = new Set(selected.map(id => byId.get(id)!.channelId!));
  const candidates = library.entries.filter(videoApprovalAllows).flatMap(entry => {
    const video = byId.get(entry.videoId), views = Number(video?.viewCount);
    return video?.available === true && video.channelId && Number.isFinite(views) && views >= 0 ? [video] : [];
  }).sort((a, b) => Number(b.viewCount) - Number(a.viewCount) || a.videoId.localeCompare(b.videoId));
  for (const video of candidates) {
    if (selected.includes(video.videoId) || channels.has(video.channelId!)) continue;
    selected.push(video.videoId); channels.add(video.channelId!);
    if (selected.length === 5) break;
  }
  return selected;
}
/** Each action merges into the latest library; unrelated edits and personal saves are untouched. */
export function editVideoLibrary(current: VideoLibrary, action: LibraryAction, now = Date.now()): VideoLibrary {
  let entries = current.entries.map(entry => ({ ...entry })), featuredIds = [...current.featuredIds];
  if (action.type === 'save') {
    for (const video of action.videos) {
      if (!/^[\w-]{11}$/.test(video.videoId)) throw new Error('Invalid video identity.');
      // Repeated search/save must never reverse a deliberate administrator approval.
      if (!entries.some(entry => entry.videoId === video.videoId)) entries.push({ videoId: video.videoId,
        approved: video.matchStatus === 'matching', reviewReason: video.matchReason.slice(0, 250), addedAt: now });
    }
  } else {
    const entry = entries.find(item => item.videoId === action.videoId);
    if (!entry) throw new Error('This video is no longer in the chapter library. Reload the library.');
    if (action.type === 'approve') { entry.approved = true; entry.reviewReason = ''; }
    if (action.type === 'feature') {
      if (!videoApprovalAllows(entry)) throw new Error('Review and approve this video before featuring it.');
      if (!featuredIds.includes(entry.videoId)) {
        if (featuredIds.length >= 5) throw new Error('Five videos are featured. Unfeature one before choosing another.');
        featuredIds.push(entry.videoId);
      }
    }
    if (action.type === 'unfeature' || action.type === 'remove') featuredIds = featuredIds.filter(id => id !== entry.videoId);
    if (action.type === 'remove') entries = entries.filter(item => item.videoId !== entry.videoId);
  }
  const result = { entries, featuredIds, revision: current.revision + 1 };
  if (JSON.stringify(result).length > 500000) throw new Error('This chapter library is full. Remove unused videos before adding more.');
  return result;
}
export function libraryForViewer(library: VideoLibrary, details: ChapterVideo[], admin: boolean) {
  const byId = new Map(details.map(video => [video.videoId, video]));
  const videos: LibraryVideo[] = library.entries.filter(entry => admin || videoApprovalAllows(entry)).map(entry => ({
    ...(byId.get(entry.videoId) || { videoId: entry.videoId, title: 'Saved YouTube video', channelTitle: 'Details temporarily unavailable', thumbnail: '', viewCount: '0', duration: null }),
    approved: videoApprovalAllows(entry), reviewReason: entry.reviewReason,
  }));
  return { videos, featured: library.featuredIds.flatMap(id => videos.find(v => v.videoId === id) || []), revision: library.revision };
}
