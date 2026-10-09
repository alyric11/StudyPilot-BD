import { Timestamp } from 'firebase-admin/firestore';
import { getServerFirestore } from './firebaseAdmin.ts';
import type { ChapterVideo } from '../src/utils/chapterVideos.ts';

export const METADATA_TTL = 28 * 86400000;
type Metadata = { checkedAt: number; video: ChapterVideo };
interface MetadataStore { read(ids: string[]): Promise<Metadata[]>; write(records: Metadata[]): Promise<void> }
export const unavailableVideo = (videoId: string, checkedAt: number): ChapterVideo => ({ videoId, title: 'Unavailable YouTube video', channelTitle: 'This video may be private or removed.', thumbnail: '', viewCount: '0', duration: null, available: false, checkedAt });
export function createVideoMetadataService(store: MetadataStore, retrieve: (ids: string[]) => Promise<any[]>, now = Date.now) {
  const memory = new Map<string, Metadata>();
  const pending = new Map<string, Promise<ChapterVideo[]>>();
  const remember = (records: Metadata[]) => { for (const record of records) {
    if (memory.size >= 1000) memory.delete(memory.keys().next().value!);
    memory.set(record.video.videoId, record);
  } };
  const seed = async (videos: ChapterVideo[]) => {
    const records = videos.map(video => ({ checkedAt: now(), video: {
      videoId: video.videoId, title: video.title, channelTitle: video.channelTitle, channelId: video.channelId || '',
      thumbnail: video.thumbnail, viewCount: video.viewCount, duration: video.duration,
      available: true, checkedAt: now(),
    } }));
    await store.write(records); remember(records);
  };
  const get = async (input: string[], requireChannels = false): Promise<ChapterVideo[]> => {
    const ids = [...new Set(input)].filter(id => /^[\w-]{11}$/.test(id));
    if (!ids.length) return [];
    const key = `${requireChannels}:` + [...ids].sort().join(',');
    if (pending.has(key)) return pending.get(key)!;
    const work = (async () => {
      const fresh = (record: Metadata | undefined) => record && record.checkedAt + METADATA_TTL > now() &&
        (!requireChannels || record.video.available === false || !!record.video.channelId);
      const missing = ids.filter(id => !fresh(memory.get(id)));
      if (missing.length) remember(await store.read(missing));
      const stale = ids.filter(id => !fresh(memory.get(id)));
      for (let start = 0; start < stale.length; start += 50) {
        const group = stale.slice(start, start + 50), items = await retrieve(group);
        const records = group.map(id => {
          const item = items.find(item => item.id === id), checkedAt = now();
          const video: ChapterVideo = item?.snippet ? { videoId: id, title: String(item.snippet.title || 'YouTube video'),
            channelTitle: String(item.snippet.channelTitle || ''), channelId: String(item.snippet.channelId || ''), thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
            viewCount: String(item.statistics?.viewCount || '0'), duration: item.contentDetails?.duration || null, available: true, checkedAt,
          } : unavailableVideo(id, checkedAt);
          return { checkedAt, video };
        });
        await store.write(records); remember(records);
      }
      return ids.flatMap(id => fresh(memory.get(id)) ? memory.get(id)!.video : []);
    })();
    pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  };
  return { get, seed };
}
const store: MetadataStore = {
  async read(ids) {
    const db = getServerFirestore();
    const records = [];
    for (let start = 0; start < ids.length; start += 100) {
      const snapshots = await db.getAll(...ids.slice(start, start + 100).map(id => db.collection('youtubeVideoMetadata').doc(id)));
      records.push(...snapshots.filter(snapshot => snapshot.exists).map(snapshot => snapshot.data() as Metadata));
    }
    return records;
  },
  async write(records) {
    const db = getServerFirestore();
    for (let start = 0; start < records.length; start += 100) {
      const batch = db.batch();
      for (const record of records.slice(start, start + 100)) batch.set(db.collection('youtubeVideoMetadata').doc(record.video.videoId),
        { ...record, deleteAfter: Timestamp.fromMillis(record.checkedAt + METADATA_TTL) });
      await batch.commit();
    }
  },
};
export const videoMetadata = createVideoMetadataService(store, async ids => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('Video details are temporarily unavailable.');
  const params = new URLSearchParams({ part: 'snippet,statistics,contentDetails', id: ids.join(','), key });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Could not refresh video details. Please try later.');
  return (await response.json()).items || [];
});
