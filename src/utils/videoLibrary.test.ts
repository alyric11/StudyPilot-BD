import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { editVideoLibrary, seedVideoLibrary, libraryForViewer, selectFeaturedVideos } from './videoLibrary.ts';
import type { SearchVideo } from './videoSearch.ts';
import { videoCandidatePage } from './chapterVideos.ts';
import { createVideoMetadataService, METADATA_TTL } from '../../server/videoMetadata.ts';
import { requireVideoAdmin } from '../../server/videoLibrary.ts';
import { createVideoPoolService, fetchVideoPoolPage, POOL_TTL, SEARCH_VERSION, poolKey, type VideoPool } from '../../server/videoSearchPool.ts';
import { resolveVideoContext } from './videoSearch.ts';
import { videoAdminAllowed, videoDailyLimitBypassed, videoPasswordBypassed } from '../../server/videoDevelopment.ts';
import { checkSearchReservation, searchBudgetDay } from '../../server/videoSearchPool.ts';

test('temporary development switches bypass only video password and daily cap and can restore both', () => {
  const names = ['VIDEO_DEV_PASSWORD_BYPASS', 'VIDEO_DEV_UNLIMITED_SEARCH', 'OVERVIEW_ADMIN_TOKEN'] as const;
  const original = names.map(name => process.env[name]);
  try {
    delete process.env.VIDEO_DEV_PASSWORD_BYPASS; delete process.env.VIDEO_DEV_UNLIMITED_SEARCH;
    assert.equal(videoPasswordBypassed(), true); assert.equal(videoDailyLimitBypassed(), true);
    assert.equal(videoAdminAllowed(undefined), true);
    const now = Date.now(), budget = { day: searchBudgetDay(now), count: 1000 };
    assert.equal(checkSearchReservation({}, budget, now, Infinity), 1001);
    assert.throws(() => checkSearchReservation({ leaseUntil: now + 10000 }, budget, now, Infinity), /already being/);
    assert.throws(() => checkSearchReservation({ retryAfter: now + 10000 }, budget, now, Infinity), /retry in a minute/);
    process.env.VIDEO_DEV_PASSWORD_BYPASS = 'false'; process.env.VIDEO_DEV_UNLIMITED_SEARCH = 'false';
    process.env.OVERVIEW_ADMIN_TOKEN = 'test-only';
    assert.equal(videoPasswordBypassed(), false); assert.equal(videoDailyLimitBypassed(), false);
    assert.equal(videoAdminAllowed(undefined), false); assert.equal(videoAdminAllowed('test-only'), true);
    assert.throws(() => checkSearchReservation({}, budget, now, 20), /allowance/);
    process.env.VIDEO_DEV_PASSWORD_BYPASS = 'invalid'; assert.equal(videoPasswordBypassed(), false);
  } finally { names.forEach((name, index) => { if (original[index] === undefined) delete process.env[name]; else process.env[name] = original[index]; }); }
});

const videos: SearchVideo[] = Array.from({ length: 25 }, (_, i) => ({ videoId: `video${String(i).padStart(6, '0')}`,
  title: `Vector lesson ${i + 1}`, channelTitle: 'Teacher', thumbnail: '', viewCount: '6000', duration: 'PT10M',
  matchStatus: i === 24 ? 'uncertain' : 'matching', matchReason: i === 24 ? 'Curriculum level needs review.' : '', available: true,
}));
test('automatic selection ranks the whole library by views and uses distinct channel IDs, not names', () => {
  const details = videos.slice(0, 9).map((video, i) => ({ ...video, channelId: `channel-${i === 1 ? 0 : i}`,
    channelTitle: 'Same display name', viewCount: String(10000 - i * 100) }));
  details[8].viewCount = '990000';
  const library = editVideoLibrary(seedVideoLibrary([]), { type: 'save', videos: details });
  const selected = selectFeaturedVideos(library, details, true);
  assert.deepEqual(selected, [8, 0, 2, 3, 4].map(i => videos[i].videoId));
  assert.equal(new Set(selected.map(id => details.find(video => video.videoId === id)!.channelId)).size, 5);
  assert.deepEqual(library.featuredIds, []);
});
test('bulk-save filling preserves editorial choices while deliberate replacement can change them', () => {
  const details = videos.slice(0, 8).map((video, i) => ({ ...video, channelId: `channel-${i}`, viewCount: String(i * 10000) }));
  let library = editVideoLibrary(seedVideoLibrary(details.slice(0, 2)), { type: 'save', videos: details });
  assert.deepEqual(selectFeaturedVideos(library, details), [0, 1, 7, 6, 5].map(i => videos[i].videoId));
  assert.deepEqual(selectFeaturedVideos(library, details, true), [7, 6, 5, 4, 3].map(i => videos[i].videoId));
  library = { ...library, featuredIds: details.slice(0, 5).map(video => video.videoId) };
  assert.deepEqual(selectFeaturedVideos(library, []), library.featuredIds);
  assert.deepEqual(selectFeaturedVideos({ ...library, featuredIds: [videos[0].videoId] }, []), [videos[0].videoId]);
});
test('automatic selection includes uncertain candidates and excludes unavailable, unknown-channel and invalid-view entries', () => {
  const details = videos.slice(0, 7).map(video => ({ ...video, channelId: 'one-channel' }));
  details[0].available = false; details[1].channelId = ''; details[2].viewCount = 'NaN';
  details[6].channelId = 'pending-channel'; details[6].matchStatus = 'uncertain';
  const library = editVideoLibrary(seedVideoLibrary([]), { type: 'save', videos: details });
  assert.deepEqual(selectFeaturedVideos(library, details, true), [videos[3].videoId, videos[6].videoId]);
  assert.deepEqual(selectFeaturedVideos(seedVideoLibrary([]), [], true), []);
});
test('older cached metadata gets channel IDs through details once, without any search', async () => {
  let calls = 0;
  const records = new Map<string, any>();
  const service = createVideoMetadataService({ read: async ids => ids.flatMap(id => records.get(id) || []),
    write: async values => { values.forEach(value => records.set(value.video.videoId, value)); } }, async ids => {
    calls++; return ids.map(id => ({ id, snippet: { title: 'Updated', channelTitle: 'Renamed teacher', channelId: 'stable-channel' } }));
  });
  await service.seed([videos[0]]);
  await service.get([videos[0].videoId]); assert.equal(calls, 0);
  assert.equal((await service.get([videos[0].videoId], true))[0].channelId, 'stable-channel');
  await service.get([videos[0].videoId], true); assert.equal(calls, 1);
  await service.seed([{ ...videos[1], channelId: 'known-channel' }]);
  assert.equal((await service.get([videos[1].videoId], true))[0].channelId, 'known-channel'); assert.equal(calls, 1);
});
test('legacy recommendations seed as featured; save-all merges without replacing recommendations or duplicates', () => {
  const legacy = videos.slice(0, 5), before = structuredClone(legacy), seed = seedVideoLibrary(legacy);
  const library = editVideoLibrary(seed, { type: 'save', videos });
  assert.equal(library.entries.length, 25); assert.deepEqual(library.featuredIds, legacy.map(v => v.videoId));
  assert.equal(editVideoLibrary(library, { type: 'save', videos }).entries.length, 25);
  assert.deepEqual(legacy, before); assert.equal(seed.entries.length, 5);
  assert.equal(library.entries[24].approved, false);
});
test('approval, feature limits, unfeaturing and removal preserve independent personal links', () => {
  let library = editVideoLibrary(seedVideoLibrary(videos.slice(0, 5)), { type: 'save', videos });
  assert.throws(() => editVideoLibrary(library, { type: 'feature', videoId: videos[24].videoId }), /Five/);
  assert.throws(() => editVideoLibrary(library, { type: 'feature', videoId: videos[5].videoId }), /Five/);
  library = editVideoLibrary(library, { type: 'unfeature', videoId: videos[0].videoId });
  assert.equal(library.entries.length, 25);
  library = editVideoLibrary(library, { type: 'feature', videoId: videos[24].videoId });
  library = editVideoLibrary(library, { type: 'save', videos: [videos[24]] });
  assert.equal(library.entries[24].approved, false);
  const personal = [videos[24].videoId];
  library = editVideoLibrary(library, { type: 'remove', videoId: videos[24].videoId });
  assert.equal(library.entries.some(v => v.videoId === videos[24].videoId), false);
  assert.equal(library.featuredIds.includes(videos[24].videoId), false);
  assert.deepEqual(personal, [videos[24].videoId]);
  assert.equal(library.entries.length, 24);
});
test('existing pending candidates are available without approval; removed and unavailable videos stay excluded', () => {
  let library = editVideoLibrary(seedVideoLibrary(videos.slice(0, 5)), { type: 'save', videos });
  library = editVideoLibrary(library, { type: 'remove', videoId: videos[0].videoId });
  const details = videos.map(v => ({ ...v, available: v.videoId !== videos[6].videoId }));
  const student = libraryForViewer(library, details, false), admin = libraryForViewer(library, details, true);
  assert.equal(student.videos.some(v => !v.approved), false);
  assert.equal(admin.videos.some(v => !v.approved), false);
  assert.equal(student.videos.some(v => v.videoId === videos[24].videoId), true);
  assert.equal(library.entries.find(v => v.videoId === videos[24].videoId)?.approved, false);
  const explore = student.videos.filter(v => v.available === true);
  const first = videoCandidatePage(explore, student.featured, [videos[5].videoId], 0);
  assert.equal(first.videos.some(v => [videos[0].videoId, videos[5].videoId, videos[6].videoId, videos[24].videoId].includes(v.videoId)), false);
  assert.deepEqual(videoCandidatePage(explore, student.featured, [videos[5].videoId], 0).videos, first.videos);
  assert.equal(libraryForViewer(library, [], false).featured.length, 4);
});
test('cached and batched metadata refreshes without searches and marks unavailable IDs without deleting them', async () => {
  let now = 1000, calls = 0;
  const records = new Map();
  const store = { read: async (ids: string[]) => ids.flatMap(id => records.get(id) || []), write: async (values: any[]) => { values.forEach(v => records.set(v.video.videoId, v)); } };
  const retrieve = async (ids: string[]) => { calls++; return ids.filter(id => id !== videos[1].videoId).map(id => ({ id, snippet: { title: 'Updated title', channelTitle: 'Teacher' }, statistics: { viewCount: '7000' }, contentDetails: { duration: 'PT11M' } })); };
  const service = createVideoMetadataService(store, retrieve, () => now);
  await service.seed(videos.slice(0, 2));
  assert.equal((await service.get(videos.slice(0, 2).map(v => v.videoId))).length, 2); assert.equal(calls, 0);
  now += METADATA_TTL + 1;
  const refreshed = await Promise.all([service.get(videos.slice(0, 2).map(v => v.videoId)), service.get(videos.slice(0, 2).map(v => v.videoId))]);
  assert.equal(calls, 1); assert.equal(refreshed[0][0].title, 'Updated title'); assert.equal(refreshed[0][1].available, false);
  await createVideoMetadataService(store, retrieve, () => now).get(videos.slice(0, 2).map(v => v.videoId));
  assert.equal(calls, 1);
});
test('metadata failure does not return expired data or erase stored records', async () => {
  let now = 1000;
  const saved: any[] = [];
  const service = createVideoMetadataService({ read: async () => saved, write: async values => { saved.push(...values); } }, async () => { throw Error('offline'); }, () => now);
  await service.seed([videos[0]]); now += METADATA_TTL + 1;
  await assert.rejects(service.get([videos[0].videoId]), /offline/);
  assert.equal(saved[0].video.videoId, videos[0].videoId);
});
test('YouTube search middleware rejects students even when they claim admin mode', () => {
  const original = process.env.OVERVIEW_ADMIN_TOKEN;
  const originalBypass = process.env.VIDEO_DEV_PASSWORD_BYPASS;
  process.env.VIDEO_DEV_PASSWORD_BYPASS = 'false';
  process.env.OVERVIEW_ADMIN_TOKEN = 'test-only-admin';
  try {
    for (const token of [undefined, 'incorrect', 'test-only-admin']) {
      let passed = false, status = 200;
      requireVideoAdmin({ header: () => token, query: { mode: 'admin' } } as unknown as Request,
        { status: (value: number) => { status = value; return { json: () => {} }; } } as unknown as Response, () => { passed = true; });
      assert.equal(passed, token === 'test-only-admin'); assert.equal(status, passed ? 200 : 403);
    }
  } finally {
    if (original === undefined) delete process.env.OVERVIEW_ADMIN_TOKEN; else process.env.OVERVIEW_ADMIN_TOKEN = original;
    if (originalBypass === undefined) delete process.env.VIDEO_DEV_PASSWORD_BYPASS; else process.env.VIDEO_DEV_PASSWORD_BYPASS = originalBypass;
  }
});
test('explicit more-candidates requests use one separate cached upstream page and preserve its cursor', async () => {
  const base = resolveVideoContext('Class 11', 'physics1', 'p1_11_ch2');
  const context = { ...base, pageToken: 'next-page-test' };
  assert.notEqual(poolKey(base), poolKey(context));
  const urls: URL[] = [];
  const page = await fetchVideoPoolPage(context, 'test-only', (async input => {
    const url = new URL(String(input)); urls.push(url);
    return new Response(JSON.stringify(url.pathname.endsWith('/search') ? { items: [], nextPageToken: 'third-page-test' } : { items: [] }));
  }) as typeof fetch);
  assert.equal(urls.length, 1); assert.equal(urls[0].searchParams.get('pageToken'), 'next-page-test');
  assert.equal(page.nextPageToken, 'third-page-test');
  let pool: VideoPool | undefined, searches = 0;
  const service = createVideoPoolService({ read: async () => pool, claim: async () => undefined, complete: async (_key, _owner, value) => { pool = value; }, fail: async () => {} }, async () => { searches++; return page; });
  await service(context); await service(context); assert.equal(searches, 1); assert.equal(pool?.nextPageToken, 'third-page-test');
});
