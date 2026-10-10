import test from 'node:test';
import assert from 'node:assert/strict';
import type { Firestore } from 'firebase-admin/firestore';
import { class11Subjects } from '../data/class11';
import { class12Subjects } from '../data/class12';
import { sharedHscChapterPairs } from '../data/sharedHscChapters';
import { sharedChapterIdentity } from './sharedChapterIdentity';
import { chapterKey, createSharedContentStore } from '../../server/sharedContent';
import { legacyLibraries, mergeSharedLibraries, mergeSharedOverviews } from '../../server/sharedChapterMerge';
import { readSharedVideoLibrary } from '../../server/sharedVideoLibrary';
import { editVideoLibrary, seedVideoLibrary } from './videoLibrary';

test('every HSC chapter has exactly one reviewed pair; subjects and papers stay distinct', () => {
  const subjects = (factory: typeof class11Subjects) => new Map(['Science', 'Business Studies', 'Humanities', 'None']
    .flatMap(group => factory(group)).map(subject => [subject.id, subject]));
  const first = subjects(class11Subjects), second = subjects(class12Subjects);
  const seen = new Set<string>();
  for (const [subject, a, b] of sharedHscChapterPairs) {
    const one = first.get(subject)?.chapters.find(chapter => chapter.id === a);
    const two = second.get(subject)?.chapters.find(chapter => chapter.id === b);
    assert.ok(one && two, `${subject}: both chapters must still exist`);
    assert.equal(one.banglaName.normalize('NFC'), two.banglaName.normalize('NFC'));
    assert.equal(one.nctbBookName, two.nctbBookName);
    assert.equal(one.section, two.section);
    if (a !== 'ict_11_ch1') assert.equal(one.name, two.name);
    if (subject !== 'bangla_2') assert.equal(one.chapterNumber, two.chapterNumber);
    const identity = sharedChapterIdentity(subject, a);
    assert.deepEqual(identity, sharedChapterIdentity(subject, b));
    assert.equal(seen.has(identity.key), false); seen.add(identity.key);
    assert.equal(chapterKey(subject, a), chapterKey(subject, b));
  }
  assert.equal(seen.size, [...first.values()].reduce((n, subject) => n + subject.chapters.length, 0));
  assert.equal(seen.size, [...second.values()].reduce((n, subject) => n + subject.chapters.length, 0));
  assert.notEqual(chapterKey('physics1', 'p1_11_ch1'), chapterKey('physics2', 'p2_11_ch1'));
  assert.deepEqual(sharedChapterIdentity('physics', 'p_9_ch1'), { key: 'physics:p_9_ch1', legacyKeys: [] });
});

test('shared overview preserves legacy paragraphs and rejects competing originals', () => {
  const overview = { introduction: 'Long edited overview\n\nKeep every paragraph.', importantTopics: [] };
  assert.deepEqual(mergeSharedOverviews([{}, { overview }]), overview);
  assert.deepEqual(mergeSharedOverviews([{ overview }, { overview: structuredClone(overview) }]), overview);
  assert.throws(() => mergeSharedOverviews([{ overview }, { overview: { ...overview, introduction: 'Different' } }]), /Both originals are preserved/);
});

const video = (videoId: string) => ({ videoId, title: 'Lesson', channelTitle: 'Channel', thumbnail: '', viewCount: '1', duration: null });
test('legacy libraries merge unique videos and approvals, preserving featured choices', () => {
  const first = seedVideoLibrary([video('aaaaaaaaaaa')]);
  first.entries[0].approved = false;
  const second = seedVideoLibrary([video('aaaaaaaaaaa')]);
  second.entries.push({ videoId: 'bbbbbbbbbbb', approved: true, reviewReason: '', addedAt: 1 });
  const original = structuredClone([first, second]);
  const merged = mergeSharedLibraries([first, second]);
  assert.equal(merged.entries.length, 2); assert.equal(merged.entries[0].approved, true);
  assert.deepEqual(merged.featuredIds, ['aaaaaaaaaaa']);
  assert.deepEqual([first, second], original);
  assert.throws(() => mergeSharedLibraries([first, seedVideoLibrary([video('ccccccccccc')])]), /featured video selections/);
  assert.deepEqual(legacyLibraries([{ videos: [video('ccccccccccc')] }], [second]), [second]);
});

test('approved Physics chapter resolutions keep Class 11 features and both pools', () => {
  const first = seedVideoLibrary([video('aaaaaaaaaaa')]);
  const second = seedVideoLibrary([video('bbbbbbbbbbb')]);
  for (const chapter of ['p2_11_ch3', 'p2_11_ch8']) {
    const { key } = sharedChapterIdentity('physics2', chapter);
    const merged = mergeSharedLibraries([first, second], key);
    assert.deepEqual(merged.featuredIds, first.featuredIds);
    assert.deepEqual(merged.entries.map(entry => entry.videoId), ['aaaaaaaaaaa', 'bbbbbbbbbbb']);
    // An intentional empty Class 11 selection also remains empty.
    assert.deepEqual(mergeSharedLibraries([{ ...first, featuredIds: [] }, second], key).featuredIds, []);
  }
  assert.throws(() => mergeSharedLibraries([first, second], chapterKey('physics2', 'p2_11_ch4')), /featured video selections/);
});

test('resolved chapters share Class 11 features; later shared choices override the transition decision', async () => {
  const { key, legacyKeys } = sharedChapterIdentity('physics2', 'p2_11_ch3');
  const first = seedVideoLibrary([video('aaaaaaaaaaa')]);
  const second = seedVideoLibrary([video('bbbbbbbbbbb')]);
  const records = new Map<string, any>(legacyKeys.map((id, index) => [
    `chapterVideoLibraries/${id}`, { library: index === 0 ? first : second },
  ]));
  const db = { collection: (collection: string) => ({ doc: (id: string) => ({ get: async () => ({ data: () => records.get(`${collection}/${id}`) }) }) }) } as unknown as Firestore;
  for (const chapter of ['p2_11_ch3', 'p2_12_ch3']) {
    const library = await readSharedVideoLibrary(chapterKey('physics2', chapter), undefined, db);
    assert.deepEqual(library.featuredIds, first.featuredIds);
    assert.equal(library.entries.length, 2);
  }
  records.set(`chapterVideoLibraries/${key}`, { library: second });
  assert.deepEqual(await readSharedVideoLibrary(key, undefined, db), second);
  assert.deepEqual(records.get(`chapterVideoLibraries/${legacyKeys[0]}`).library, first);
});

test('both classes load legacy pools and see a shared edit; originals and personal records remain unchanged', async () => {
  const { key, legacyKeys } = sharedChapterIdentity('physics1', 'p1_11_ch1');
  const records = new Map<string, any>([
    [`chapterVideoLibraries/${legacyKeys[1]}`, { library: seedVideoLibrary([video('aaaaaaaaaaa')]) }],
    ['users/student/personal', { saved: ['bbbbbbbbbbb'], progress: 'complete' }],
  ]);
  const original = structuredClone([...records]);
  const db = { collection: (collection: string) => ({ doc: (id: string) => ({ get: async () => ({ data: () => records.get(`${collection}/${id}`) }) }) }) } as unknown as Firestore;
  const initial = await readSharedVideoLibrary(chapterKey('physics1', 'p1_11_ch1'), undefined, db);
  assert.deepEqual(initial.featuredIds, ['aaaaaaaaaaa']);
  const updated = editVideoLibrary(initial, { type: 'unfeature', videoId: 'aaaaaaaaaaa' });
  records.set(`chapterVideoLibraries/${key}`, { library: updated });
  assert.deepEqual(await readSharedVideoLibrary(chapterKey('physics1', 'p1_12_ch1'), undefined, db), updated);
  for (const [id, record] of original) assert.deepEqual(records.get(id), record);
});

test('overview saves invalidate the common cache regardless of originating class', async () => {
  let record = { overview: { introduction: 'Old', importantTopics: [] } };
  const store = createSharedContentStore(async () => structuredClone(record), async (_key, fields) => { record = { ...record, ...fields }; });
  const first = chapterKey('physics1', 'p1_11_ch1'), second = chapterKey('physics1', 'p1_12_ch1');
  await store.read(second);
  await store.write(first, { overview: { introduction: 'Updated', importantTopics: [] } });
  assert.equal((await store.read(second)).overview?.introduction, 'Updated');
});
