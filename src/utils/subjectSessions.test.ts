import assert from "node:assert/strict";
import { test } from "node:test";
import type { Subject } from "../data/curriculum";
import type { DailyRoutineTask, RoutineBlock } from "../types";
import { nextSubjectSession } from "./subjectSessions.ts";
import { getDailyRoutineTasks } from "./routineTasks.ts";

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
