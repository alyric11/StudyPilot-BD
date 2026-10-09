import assert from "node:assert/strict";
import { test } from "node:test";
import type { Subject } from "../data/curriculum";
import type { DailyRoutineTask, RoutineBlock } from "../types";
import { nextSubjectSession, upcomingSubjectSessions } from "./subjectSessions.ts";
import { getDailyRoutineTasks, getScheduledRoutineTasks, updateDatedHomework } from "./routineTasks.ts";

const subjects: Subject[] = [1, 2].map(n => ({ id: `physics${n}`, name: `Physics ${n === 1 ? "1st" : "2nd"} Paper`, banglaName: "পদার্থবিজ্ঞান", color: "cyan", chapters: [] }));
const now = new Date(2026, 8, 27, 16); // Sunday in the student's local time.
const block = (id: string, day = 0, start = "18:00", subjectId = "physics1"): RoutineBlock => ({
  id, dayOfWeek: day, startTime: start, endTime: "19:00", subjectId, title: "Physics", chapterId: "legacy-chapter", homeworkText: "legacy homework",
});
const next = (blocks: RoutineBlock[], records: DailyRoutineTask[] = []) => nextSubjectSession("physics1", blocks, records, subjects, [], now);

test("nearest future session belongs to the exact paper and has no inherited weekly homework", () => {
  const result = next([block("other", 0, "17:00", "physics2"), block("tomorrow", 1), block("later"), block("passed", 0, "15:00")])!;
  assert.equal(result.block.id, "later");
  assert.equal(result.date, "2026-09-27");
  assert.equal(result.block.chapterId, undefined);
  assert.equal(result.block.homeworkText, undefined);
});

test("saved date-specific homework and time remain authoritative", () => {
  const routine = block("later");
  const saved = getDailyRoutineTasks("2026-09-27", [routine], [], subjects, [])[0];
  saved.block = { ...saved.block, startTime: "20:00", chapterId: "chapter2", homeworkText: "Exercise 3" };
  const result = next([routine, block("earlier", 0, "19:00")], [saved])!;
  assert.equal(result.block.id, "earlier");
  assert.equal(next([routine], [saved])?.block.homeworkText, "Exercise 3");
});

test("completed sessions roll forward; deleted schedules never appear", () => {
  const routine = block("weekly");
  const saved = { ...getDailyRoutineTasks("2026-09-27", [routine], [], subjects, [])[0], completed: true };
  assert.equal(next([routine], [saved])?.date, "2026-10-04");
  assert.equal(next([], [saved]), null);
});

test("a session starting now is not upcoming and overnight end times do not change its date", () => {
  assert.equal(next([block("now", 0, "16:00")])?.date, "2026-10-04");
  assert.equal(next([{ ...block("night", 0, "23:00"), endTime: "00:30" }])?.date, "2026-09-27");
});

test('upcoming six start tomorrow, match the paper, and repeat weekly in chronological order without inherited HW', () => {
  const tasks = upcomingSubjectSessions('physics1', [block('today'), block('mon', 1), block('tue-late', 2, '20:00'), block('tue-early', 2, '17:00'), block('other', 1, '16:00', 'physics2')], [], subjects, [], now);
  assert.equal(tasks.length, 6);
  assert.deepEqual(tasks.map(task => [task.date, task.block.id]), [
    ['2026-09-28', 'mon'], ['2026-09-29', 'tue-early'], ['2026-09-29', 'tue-late'],
    ['2026-10-04', 'today'], ['2026-10-05', 'mon'], ['2026-10-06', 'tue-early'],
  ]);
  assert.ok(tasks.every(task => !task.block.chapterId && !task.block.homeworkText));
});

test('upcoming dated HW and overridden time are authoritative; saving affects one occurrence and matches planner', () => {
  const routines = [block('mon', 1), block('second', 1, '19:30')];
  const saved = getDailyRoutineTasks('2026-09-28', routines, [], subjects, [])[0];
  saved.block = { ...saved.block, startTime: '20:00', endTime: '21:00', homeworkText: 'Existing HW' };
  saved.completed = true;
  const tasks = upcomingSubjectSessions('physics1', routines, [saved], subjects, [], now);
  assert.equal(tasks[0].block.id, 'second');
  assert.equal(tasks[1].block.homeworkText, 'Existing HW');
  const updated = updateDatedHomework(tasks[1], null, ' Edited HW ', subjects, []);
  const records = [updated];
  const upcoming = upcomingSubjectSessions('physics1', routines, records, subjects, [], now);
  assert.deepEqual(upcoming[1], getScheduledRoutineTasks(updated.date, routines, records, subjects, [])[1]);
  assert.equal(upcoming[1].completed, true);
  assert.equal(upcoming[1].block.startTime, '20:00');
  assert.equal(upcoming[1].block.homeworkText, 'Edited HW');
  assert.equal(upcoming.find(task => task.date === '2026-10-05' && task.block.id === 'mon')?.block.homeworkText, undefined);
  assert.equal(routines[0].homeworkText, 'legacy homework');
});

test('upcoming ignores deleted or moved weekly slots and handles empty schedules and dated subject exceptions', () => {
  const saved = getDailyRoutineTasks('2026-09-28', [block('mon', 1)], [], subjects, [])[0];
  assert.deepEqual(upcomingSubjectSessions('physics1', [], [saved], subjects, [], now), []);
  const moved = upcomingSubjectSessions('physics1', [block('mon', 2)], [saved], subjects, [], now);
  assert.equal(moved[0].date, '2026-09-29');
  const otherSubject = { ...saved, subjectKey: 'subject:physics2', block: { ...saved.block, subjectId: 'physics2' } };
  const tasks = upcomingSubjectSessions('physics1', [block('mon', 1)], [otherSubject], subjects, [], now);
  assert.equal(tasks.length, 6);
  assert.equal(tasks[0].date, '2026-10-05');
});
