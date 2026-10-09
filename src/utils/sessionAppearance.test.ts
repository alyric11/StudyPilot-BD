import test from 'node:test';
import assert from 'node:assert/strict';
import { bangladeshDateKey, sessionTone } from './sessionAppearance.ts';
import type { RoutineBlock } from '../types';

const block: RoutineBlock = { id: 'physics', title: 'Physics', dayOfWeek: 5, startTime: '18:00', endTime: '19:00', homeworkText: 'Exercise 2' };
test('status colors follow the actual date, completion and assigned homework', () => {
  assert.equal(sessionTone('2026-10-09', true, block, '2026-10-09'), 'completed-today');
  assert.equal(sessionTone('2026-10-09', false, block, '2026-10-09'), 'subject');
  assert.equal(sessionTone('2026-10-09', true, block, '2026-10-10'), 'subject');
  assert.equal(sessionTone('2026-10-09', false, block, '2026-10-10'), 'unfinished');
  for (const completed of [true, false]) assert.equal(sessionTone('2026-10-11', completed, block, '2026-10-10'), 'subject');
  assert.equal(sessionTone('2026-10-09', false, { ...block, homeworkText: '  ' }, '2026-10-10'), 'subject');
  assert.equal(sessionTone('2026-10-09', false, { ...block, homeworkText: '', chapterId: 'chapter-2' }, '2026-10-10'), 'unfinished');
});
test('Bangladesh midnight changes presentation without changing saved completion', () => {
  const before = bangladeshDateKey(new Date('2026-10-09T17:59:59.999Z'));
  const after = bangladeshDateKey(new Date('2026-10-09T18:00:00.000Z'));
  assert.equal(before, '2026-10-09'); assert.equal(after, '2026-10-10');
  assert.equal(sessionTone(before, true, block, before), 'completed-today');
  assert.equal(sessionTone(before, true, block, after), 'subject');
  assert.equal(sessionTone(before, false, block, after), 'unfinished');
  assert.equal(bangladeshDateKey(new Date('2026-12-31T18:00:00Z')), '2027-01-01');
  assert.equal(block.homeworkText, 'Exercise 2');
});
