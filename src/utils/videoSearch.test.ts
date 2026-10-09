import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVideoContext, classifyVideo, selectVideoCandidates } from './videoSearch.ts';
import { videoCandidatePage } from './chapterVideos.ts';
import { candidatesForViewer, createVideoPoolService, fetchVideoPool, POOL_TTL, SEARCH_VERSION, checkSearchReservation, searchBudgetDay, searchDailyLimit, poolKey, type PoolStore, type VideoPool } from '../../server/videoSearchPool.ts';

const physics = resolveVideoContext('Class 11', 'physics1', 'p1_11_ch2');
const ssc = resolveVideoContext('Class 9', 'physics', 'p_ch2');
test('search context respects intentional title fields, units, class and chapter identity', () => {
  const english = resolveVideoContext('Class 11', 'english_1', 'e1_11_u1_l1');
  assert.ok(english.query.startsWith("The Parrot's Tale HSC English 1st Paper"));
  assert.ok(english.query.includes('Unit One: Education and Life Lesson 1'));
  const bangla = resolveVideoContext('Class 11', 'bangla_1', 'b1_11_ch2');
  assert.ok(bangla.query.startsWith('অপরিচিতা HSC'));
  assert.throws(() => resolveVideoContext('Class 8', 'physics1', 'p1_11_ch2'));
  assert.throws(() => resolveVideoContext('Class 12', 'physics1', 'p1_11_ch2'));
  assert.throws(() => resolveVideoContext('Class 11', 'chemistry1', 'p1_11_ch2'));
  assert.notEqual(poolKey(physics), poolKey(resolveVideoContext('Class 12', 'physics1', 'p1_12_ch2')));
});
test('SSC/HSC boundaries, Roman numerals and Bangla class labels work in both directions', () => {
  for (const label of ['HSC', '#hsc2026', 'Class XI', 'Class XII', 'Class 11', 'Class 12', 'একাদশ', 'দ্বাদশ', 'ক্লাস ১১', 'এইচএসসি']) {
    assert.equal(classifyVideo(physics, `${label} Physics 1st Paper Vector`, '').status, 'matching', label);
    assert.equal(classifyVideo(ssc, `${label} Physics Motion`, '').status, 'excluded', label);
  }
  for (const label of ['SSC', '#ssc26', 'Class IX', 'Class X', 'Class 9', 'Class 10', 'নবম', 'দশম', 'ক্লাস ৯', 'এসএসসি']) {
    assert.equal(classifyVideo(physics, `${label} Physics Vector`, '').status, 'excluded', label);
    assert.equal(classifyVideo(ssc, `${label} Physics Motion`, '').status, 'matching', label);
  }
});
test('title evidence outranks promotional descriptions; uncertain and wrong paper are distinguished', () => {
  assert.equal(classifyVideo(physics, 'HSC Physics Vector', 'Subscribe for SSC and HSC courses').status, 'matching');
  assert.equal(classifyVideo(physics, 'Vector Physics', 'SSC and HSC courses').status, 'uncertain');
  assert.equal(classifyVideo(physics, 'SSC HSC Physics Vector', '').status, 'uncertain');
  assert.equal(classifyVideo(physics, 'HSC Physics Paper II Vector', '').status, 'excluded');
  assert.equal(classifyVideo(physics, 'HSC পদার্থবিজ্ঞান ১ম পত্র ভেক্টর', '').status, 'matching');
  assert.equal(classifyVideo(physics, 'HSC Physics 1st Paper Thermodynamics', '').status, 'uncertain');
});
const item = (id: number, title = 'HSC Physics 1st Paper Vector', views = 6000, duration = 'PT5M') => ({
  id: `video${String(id).padStart(6, '0')}`, snippet: { title, description: '', channelTitle: 'Teacher' },
  statistics: { viewCount: String(views) }, contentDetails: { duration },
});
test('candidate selection retains thresholds, deduplicates, and favours relevance before views', () => {
  const candidates = selectVideoCandidates(physics, [item(1), item(1), item(2, 'SSC Physics Vector'), item(3, undefined, 4999),
    item(4, undefined, 10000, 'PT4M59S'), item(5, 'Physics Vector', 900000), item(6, undefined, 20000)]);
  assert.deepEqual(candidates.map(v => v.videoId), ['video000006', 'video000001', 'video000005']);
  assert.equal(candidates[2].matchStatus, 'uncertain');
});
test('all 25 candidates can be browsed without mutating the pool or another student exclusions', () => {
  const pool = selectVideoCandidates(physics, Array.from({ length: 25 }, (_, i) => item(i)));
  const saved = pool.slice(0, 5), personal = [pool[5].videoId];
  assert.equal(videoCandidatePage(pool, saved, personal, 0).total, 19);
  assert.equal(videoCandidatePage(pool, saved, [], 0).total, 20);
  assert.deepEqual(videoCandidatePage(pool, [], [], 4).videos, pool.slice(20));
  assert.equal(videoCandidatePage(pool, pool.slice(0, 24), [], 4).page, 0);
  assert.equal(pool.length, 25);
});
test('students cannot receive uncertain candidates and exclusions never change the shared pool', () => {
  const videos = selectVideoCandidates(physics, [item(1), item(2), item(3, 'Physics Vector')]);
  const pool = { version: SEARCH_VERSION, fetchedAt: 0, expiresAt: POOL_TTL, videos };
  assert.deepEqual(candidatesForViewer(pool, ['video000001'], [], false).map(v => v.videoId), ['video000002']);
  assert.equal(candidatesForViewer(pool, ['video000001'], ['video000002'], false).length, 0);
  assert.equal(candidatesForViewer(pool, [], [], true).length, 3);
  assert.equal(pool.videos.length, 3);
});
function fixture() {
  let time = 1000000, pool: VideoPool | undefined, searches = 0, failures = 0;
  const store: PoolStore = {
    read: async () => pool,
    claim: async () => undefined,
    complete: async (_key, _owner, value) => { pool = value; },
    fail: async () => { failures++; },
  };
  const search = async () => { searches++; return selectVideoCandidates(physics, [item(1)]); };
  return { store, search, now: () => time, advance: (ms: number) => { time += ms; }, searches: () => searches, failures: () => failures, pool: () => pool };
}
test('simultaneous users, memory expiry and a server restart reuse one persistent pool', async () => {
  const f = fixture(), service = createVideoPoolService(f.store, f.search, f.now);
  const results = await Promise.all(Array.from({ length: 15 }, () => service(physics)));
  assert.equal(f.searches(), 1);
  assert.ok(results.every(result => result === results[0]));
  f.advance(61000); await service(physics);
  await createVideoPoolService(f.store, f.search, f.now)(physics);
  assert.equal(f.searches(), 1);
  f.advance(POOL_TTL); await service(physics);
  assert.equal(f.searches(), 2);
});
test('empty results are cached; failed search and failed persistence do not become valid pools', async () => {
  const f = fixture(); let requests = 0;
  const empty = createVideoPoolService(f.store, async () => { requests++; return []; }, f.now);
  await empty(physics); await empty(physics); assert.equal(requests, 1);
  f.advance(POOL_TTL + 1);
  const broken = createVideoPoolService(f.store, async () => { throw new Error('upstream'); }, f.now);
  await assert.rejects(broken(physics), /upstream/); assert.equal(f.failures(), 1);
  const writeFailure = createVideoPoolService({ ...f.store, complete: async () => { throw new Error('write'); } }, f.search, f.now);
  await assert.rejects(writeFailure(physics), /write/);
  assert.equal(f.pool()?.version, SEARCH_VERSION);
  assert.ok(f.pool()!.expiresAt < f.now());
});
test('reservation reuses a concurrently completed pool without spending a search', async () => {
  const f = fixture(), existing: VideoPool = { version: SEARCH_VERSION, fetchedAt: f.now(), expiresAt: f.now() + POOL_TTL, videos: [] };
  const service = createVideoPoolService({ ...f.store, claim: async () => existing }, f.search, f.now);
  assert.deepEqual(await service(physics), existing); assert.equal(f.searches(), 0);
});
test('durable reservation rules enforce cap, lease, cooldown, and Pacific reset', () => {
  const now = Date.parse('2026-10-09T06:59:00Z'), day = searchBudgetDay(now);
  assert.equal(checkSearchReservation({}, { day, count: 19 }, now, 20), 20);
  assert.throws(() => checkSearchReservation({}, { day, count: 20 }, now, 20), /allowance/);
  assert.throws(() => checkSearchReservation({ leaseUntil: now + 1 }, {}, now, 20), /already/);
  assert.throws(() => checkSearchReservation({ retryAfter: now + 1 }, {}, now, 20), /minute/);
  assert.equal(checkSearchReservation({}, { day, count: 20 }, now + 120000, 20), 1);
  assert.equal(searchDailyLimit(undefined), 20); assert.equal(searchDailyLimit('0'), 0);
  assert.throws(() => searchDailyLimit('NaN'));
});
test('one search and one batched details call build the pool; no fallback or pagination', async () => {
  const calls: URL[] = [];
  const fetcher = async (url: any) => {
    const parsed = new URL(url); calls.push(parsed);
    return new Response(JSON.stringify({ items: parsed.pathname.endsWith('/search') ? [{ id: { videoId: 'video000001' } }, { id: { videoId: 'video000001' } }] : [item(1)] }));
  };
  const pool = await fetchVideoPool(physics, 'fake-test-key', fetcher as typeof fetch);
  assert.equal(calls.length, 2); assert.equal(pool.length, 1);
  assert.equal(calls[0].searchParams.get('maxResults'), '25');
  assert.equal(calls[1].searchParams.get('id'), 'video000001');
  assert.equal(calls[0].searchParams.get('pageToken'), null);
  let failedCalls = 0;
  await assert.rejects(fetchVideoPool(physics, 'fake', (async () => { failedCalls++; return new Response('', { status: 403 }); }) as typeof fetch));
  assert.equal(failedCalls, 1);
});
