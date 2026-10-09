import { randomUUID, createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { getServerFirestore } from './firebaseAdmin.ts';
import { resolveVideoContext, selectVideoCandidates, type SearchVideo, type VideoContext } from '../src/utils/videoSearch.ts';

export const POOL_TTL = 24 * 60 * 60 * 1000;
export const SEARCH_VERSION = 1;
export type VideoPool = { version: number; fetchedAt: number; expiresAt: number; videos: SearchVideo[]; nextPageToken?: string };
export function candidatesForViewer(pool: VideoPool, publishedIds: string[], personalIds: string[], admin: boolean) {
  const excluded = new Set([...publishedIds, ...personalIds]);
  return pool.videos.filter(video => !excluded.has(video.videoId) && (admin || video.matchStatus === 'matching'));
}
export class VideoSearchError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}
export interface PoolStore {
  read(key: string): Promise<VideoPool | undefined>;
  claim(key: string, owner: string, now: number): Promise<VideoPool | undefined>;
  complete(key: string, owner: string, pool: VideoPool): Promise<void>;
  fail(key: string, owner: string, now: number): Promise<void>;
}
const fresh = (pool: VideoPool | undefined, now: number): pool is VideoPool =>
  !!pool && pool.version === SEARCH_VERSION && pool.expiresAt > now && Array.isArray(pool.videos);
export const poolKey = (context: VideoContext) => `v${SEARCH_VERSION}:${context.classLevel.replace(' ', '-')}:${context.subject.id}:${context.chapter.id}${context.pageToken ? ':' + createHash('sha256').update(context.pageToken).digest('hex') : ''}`;

/** Browser exclusions never enter this cache: the same pool serves all students. */
export function createVideoPoolService(store: PoolStore, search: (context: VideoContext) => Promise<SearchVideo[] | { videos: SearchVideo[]; nextPageToken?: string }>, now = Date.now) {
  const memory = new Map<string, { until: number; pool: VideoPool }>();
  const pending = new Map<string, Promise<VideoPool>>();
  return async (context: VideoContext) => {
    const key = poolKey(context), cached = memory.get(key);
    if (cached && cached.until > now() && fresh(cached.pool, now())) return cached.pool;
    const underway = pending.get(key);
    if (underway) return underway;
    const work = (async () => {
      let pool = await store.read(key);
      if (!fresh(pool, now())) {
        const owner = randomUUID();
        pool = await store.claim(key, owner, now());
        if (!fresh(pool, now())) {
          try {
            const result = await search(context);
            const fetchedAt = now();
            pool = { version: SEARCH_VERSION, fetchedAt, expiresAt: fetchedAt + POOL_TTL,
              videos: Array.isArray(result) ? result : result.videos,
              ...(!Array.isArray(result) && result.nextPageToken ? { nextPageToken: result.nextPageToken } : {}) };
            await store.complete(key, owner, pool);
          } catch (error) {
            await store.fail(key, owner, now()).catch(() => {});
            throw error;
          }
        }
      }
      if (memory.size >= 200) memory.delete(memory.keys().next().value!);
      memory.set(key, { until: now() + 60000, pool: pool! });
      return pool!;
    })();
    pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  };
}

// Pacific dates follow YouTube's daily reset. Count reservations, including failed attempts.
export const searchBudgetDay = (now: number) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);
export function searchDailyLimit(value: string | undefined) {
  const limit = value === undefined ? 20 : Number(value);
  if (!Number.isInteger(limit) || limit < 0 || limit > 100) throw new VideoSearchError('Video search limit is not configured correctly.');
  return limit;
}
export function checkSearchReservation(data: any, budget: any, now: number, limit: number) {
  if (data?.leaseUntil > now) throw new VideoSearchError('This chapter search is already being prepared. Please retry shortly.', 409);
  if (data?.retryAfter > now) throw new VideoSearchError('The last search could not finish. Please retry in a minute.', 429);
  const count = budget?.day === searchBudgetDay(now) ? Number(budget.count || 0) : 0;
  if (!Number.isFinite(count) || count >= limit) throw new VideoSearchError('Today’s video search allowance has been reached. Saved lessons and personal links are still available.', 429);
  return count + 1;
}
const firestoreStore: PoolStore = {
  async read(key) {
    return (await getServerFirestore().collection('youtubeSearchPools').doc(key).get()).data()?.pool;
  },
  async claim(key, owner, now) {
    const db = getServerFirestore(), ref = db.collection('youtubeSearchPools').doc(key);
    const budgetRef = db.collection('youtubeSearchControl').doc('dailyBudget');
    return db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref), data = snapshot.data();
      if (fresh(data?.pool, now)) return data!.pool as VideoPool;
      const budget = (await transaction.get(budgetRef)).data();
      const count = checkSearchReservation(data, budget, now, searchDailyLimit(process.env.YOUTUBE_DAILY_SEARCH_LIMIT));
      transaction.set(budgetRef, { day: searchBudgetDay(now), count });
      // Clear expired metadata rather than returning stale candidates after a failed refresh.
      transaction.set(ref, { owner, leaseUntil: now + 120000, deleteAfter: Timestamp.fromMillis(now + POOL_TTL) });
      return undefined;
    });
  },
  async complete(key, owner, pool) {
    const db = getServerFirestore(), ref = db.collection('youtubeSearchPools').doc(key);
    await db.runTransaction(async transaction => {
      const current = (await transaction.get(ref)).data();
      if (current?.owner !== owner) throw new VideoSearchError('This search has changed. Please retry.');
      transaction.set(ref, { pool, deleteAfter: Timestamp.fromMillis(pool.expiresAt) });
    });
  },
  async fail(key, owner, now) {
    const db = getServerFirestore(), ref = db.collection('youtubeSearchPools').doc(key);
    await db.runTransaction(async transaction => {
      if ((await transaction.get(ref)).data()?.owner === owner)
        transaction.set(ref, { retryAfter: now + 60000, deleteAfter: Timestamp.fromMillis(now + POOL_TTL) });
    });
  },
};
export async function fetchVideoPoolPage(context: VideoContext, apiKey: string, fetcher: typeof fetch = fetch) {
  if (!apiKey) throw new VideoSearchError('YouTube search is not configured.');
  async function get(endpoint: string, parameters: Record<string, string>) {
    const response = await fetcher(`https://www.googleapis.com/youtube/v3/${endpoint}?${new URLSearchParams({ ...parameters, key: apiKey })}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new VideoSearchError('YouTube could not complete this search. Please try later.');
    return response.json();
  }
  const result = await get('search', { part: 'snippet', q: context.query, type: 'video', maxResults: '25', order: 'relevance', relevanceLanguage: 'bn', regionCode: 'BD', safeSearch: 'strict', ...(context.pageToken ? { pageToken: context.pageToken } : {}) });
  const ids = [...new Set<string>((result.items || []).map((item: any) => item.id?.videoId).filter((id: unknown) => typeof id === 'string' && /^[\w-]{11}$/.test(id)))].slice(0, 25);
  if (!ids.length) return { videos: [], ...(result.nextPageToken ? { nextPageToken: String(result.nextPageToken) } : {}) };
  const details = await get('videos', { part: 'snippet,contentDetails,statistics', id: ids.join(',') });
  return { videos: selectVideoCandidates(context, details.items || []), ...(result.nextPageToken ? { nextPageToken: String(result.nextPageToken) } : {}) };
}
export async function fetchVideoPool(context: VideoContext, apiKey: string, fetcher: typeof fetch = fetch) {
  return (await fetchVideoPoolPage(context, apiKey, fetcher)).videos;
}
export async function readSavedSearchBatch(context: VideoContext, batchKey: unknown) {
  const base = poolKey({ ...context, pageToken: undefined });
  if (typeof batchKey !== 'string' || (batchKey !== base && !(batchKey.startsWith(base + ':') && /^[a-f0-9]{64}$/.test(batchKey.slice(base.length + 1)))))
    throw new VideoSearchError('Choose candidates from this chapter’s search.', 400);
  const pool = await firestoreStore.read(batchKey);
  if (!fresh(pool, Date.now())) throw new VideoSearchError('These candidates have expired. Search again before saving them.', 409);
  return pool;
}
export const getVideoPool = createVideoPoolService(firestoreStore, context => fetchVideoPoolPage(context, process.env.YOUTUBE_API_KEY || ''));
export { resolveVideoContext };
