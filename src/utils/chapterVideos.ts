export interface ChapterVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: string;
  duration: string | null;
}
export function validatePublishedVideos(value: unknown): ChapterVideo[] {
  if (!Array.isArray(value) || value.length > 5) throw new Error("Save up to five videos.");
  const ids = new Set<string>();
  return value.map(video => {
    if (!video || typeof video.videoId !== "string" || !/^[\w-]{11}$/.test(video.videoId) ||
      ids.has(video.videoId) || typeof video.title !== "string" || video.title.length > 500 ||
      typeof video.channelTitle !== "string" || video.channelTitle.length > 200) {
      throw new Error("Each video must have valid details and a unique YouTube ID.");
    }
    ids.add(video.videoId);
    return {
      videoId: video.videoId, title: video.title, channelTitle: video.channelTitle,
      thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
      viewCount: typeof video.viewCount === "string" ? video.viewCount.slice(0, 30) : "0",
      duration: typeof video.duration === "string" ? video.duration.slice(0, 100) : null,
    };
  });
}
export function unsavedVideos(videos: ChapterVideo[], published: ChapterVideo[], personalIds: string[]) {
  const excluded = new Set([...published.map(video => video.videoId), ...personalIds]);
  return videos.filter(video => {
    if (excluded.has(video.videoId)) return false;
    excluded.add(video.videoId);
    return true;
  });
}
export function visibleVideoCandidates(pool: ChapterVideo[], saved: ChapterVideo[], personalIds: string[] = []) {
  return unsavedVideos(pool.slice(0, 10), saved, personalIds).slice(0, 5);
}
export function youtubeVideoId(text: string): string | null {
  try {
    const url = new URL(text.trim());
    const id = url.hostname === "youtu.be" ? url.pathname.split("/")[1] :
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname) ?
        url.pathname === "/watch" ? url.searchParams.get("v") :
          /^\/(embed|shorts)\//.test(url.pathname) ? url.pathname.split("/")[2] : null : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
