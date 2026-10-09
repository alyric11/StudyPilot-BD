import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { editVideoLibrary, seedVideoLibrary, libraryForViewer } from './videoLibrary.ts';
import type { SearchVideo } from './videoSearch.ts';
import { videoCandidatePage } from './chapterVideos.ts';
import { createVideoMetadataService, METADATA_TTL } from '../../server/videoMetadata.ts';
import { requireVideoAdmin } from '../../server/videoLibrary.ts';
import { createVideoPoolService, fetchVideoPoolPage, POOL_TTL, SEARCH_VERSION, poolKey, type VideoPool } from '../../server/videoSearchPool.ts';
import { resolveVideoContext } from './videoSearch.ts';

const videos: SearchVideo[] = Array.from({ length: 25 }, (_, i) => ({ videoId: `video${String(i).padStart(6, '0')}`,
  title: `Vector lesson ${i + 1}`, channelTitle: 'Teacher', thumbnail: '', viewCount: '6000', duration: 'PT10M',
  matchStatus: i === 24 ? 'uncertain' : 'matching', matchReason: i === 24 ? 'Curriculum level needs review.' : '', available: true,
}));
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
  assert.throws(() => editVideoLibrary(library, { type: 'feature', videoId: videos[24].videoId }), /approve/);
  assert.throws(() => editVideoLibrary(library, { type: 'feature', videoId: videos[5].videoId }), /Five/);
  library = editVideoLibrary(library, { type: 'unfeature', videoId: videos[0].videoId });
  assert.equal(library.entries.length, 25);
  library = editVideoLibrary(library, { type: 'approve', videoId: videos[24].videoId });
  library = editVideoLibrary(library, { type: 'feature', videoId: videos[24].videoId });
  library = editVideoLibrary(library, { type: 'save', videos: [videos[24]] });
  assert.equal(library.entries[24].approved, true);
  const personal = [videos[24].videoId];
  library = editVideoLibrary(library, { type: 'remove', videoId: videos[24].videoId });
  assert.equal(library.entries.some(v => v.videoId === videos[24].videoId), false);
  assert.equal(library.featuredIds.includes(videos[24].videoId), false);
  assert.deepEqual(personal, [videos[24].videoId]);
  assert.equal(library.entries.length, 24);
});
test('removed legacy entries do not reappear; pending and unavailable videos are not student exploration candidates', () => {
  let library = editVideoLibrary(seedVideoLibrary(videos.slice(0, 5)), { type: 'save', videos });
  library = editVideoLibrary(library, { type: 'remove', videoId: videos[0].videoId });
  const details = videos.map(v => ({ ...v, available: v.videoId !== videos[6].videoId }));
  const student = libraryForViewer(library, details, false), admin = libraryForViewer(library, details, true);
  assert.equal(student.videos.some(v => !v.approved), false);
  assert.equal(admin.videos.some(v => !v.approved), true);
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
  process.env.OVERVIEW_ADMIN_TOKEN = 'test-only-admin';
  try {
    for (const token of [undefined, 'incorrect', 'test-only-admin']) {
      let passed = false, status = 200;
      requireVideoAdmin({ header: () => token, query: { mode: 'admin' } } as unknown as Request,
        { status: (value: number) => { status = value; return { json: () => {} }; } } as unknown as Response, () => { passed = true; });
      assert.equal(passed, token === 'test-only-admin'); assert.equal(status, passed ? 200 : 403);
    }
  } finally { if (original === undefined) delete process.env.OVERVIEW_ADMIN_TOKEN; else process.env.OVERVIEW_ADMIN_TOKEN = original; }
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
