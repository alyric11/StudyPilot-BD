import test from 'node:test';
import assert from 'node:assert/strict';
import { NCTB_CURRICULUM } from '../data/curriculum.ts';
import { navigationSessionKey, restoreNavigationSession, serializeNavigationSession, type NavigationSession } from './navigationSession.ts';

const subjects = NCTB_CURRICULUM['Class 11'].subjects.Science;
const subject = subjects.find(subject => subject.id === 'physics1')!;
const chapter = subject.chapters[0];
const home: NavigationSession = { section: 'dashboard', subjectId: null, chapterId: null, videos: false };
const restore = (page: NavigationSession) => restoreNavigationSession(serializeNavigationSession('Class 11', page), 'Class 11', subjects);

test('all main sections, subject, chapter and video pages survive a refresh round trip', () => {
  for (const section of ['dashboard', 'planner', 'homework', 'diary'] as const) assert.deepEqual(restore({ ...home, section }), { ...home, section });
  for (const page of [
    { ...home, subjectId: subject.id },
    { ...home, subjectId: subject.id, chapterId: chapter.id },
    { ...home, subjectId: subject.id, chapterId: chapter.id, videos: true },
  ]) assert.deepEqual(restore(page), page);
});
test('malformed, obsolete and wrong-class destinations safely return home', () => {
  for (const raw of [null, '{broken', '{}', JSON.stringify({ version: 2, classLevel: 'Class 11', section: 'planner' }),
    serializeNavigationSession('Class 12', { ...home, section: 'planner' }),
    JSON.stringify({ version: 1, classLevel: 'Class 11', section: 'unknown' })])
    assert.deepEqual(restoreNavigationSession(raw, 'Class 11', subjects), home);
});
test('unavailable subjects and chapters cannot restore invalid screens; account keys are separate', () => {
  const page = { ...home, subjectId: subject.id, chapterId: chapter.id, videos: true };
  assert.deepEqual(restoreNavigationSession(serializeNavigationSession('Class 11', page), 'Class 11', []), home);
  assert.deepEqual(restore({ ...page, chapterId: 'removed' }), { ...home, subjectId: subject.id });
  assert.deepEqual(restore({ ...page, section: 'planner' }), { ...home, section: 'planner' });
  assert.notEqual(navigationSessionKey('student-one'), navigationSessionKey('student-two'));
  assert.equal(serializeNavigationSession('Class 11', page).includes('password'), false);
});
