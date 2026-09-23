import assert from "node:assert/strict";
import { test } from "node:test";
import type { Subject } from "../data/curriculum";
import type { DailyRoutineTask, RoutineBlock } from "../types";
import { describeRoutineTask, findNextRoutineTask, getDailyRoutineTasks, localDateKey, parseDailyRoutineTasks, resolveRoutineChapter, setDailyRoutineCompletion } from "./routineTasks.ts";

const subjects: Subject[] = [1, 2].map((paper) => ({
  id: `physics${paper}`, name: `Physics ${paper === 1 ? "1st" : "2nd"} Paper`, banglaName: "পদার্থবিজ্ঞান", color: "cyan",
  chapters: [1, 2].map((number) => ({ id: `p${paper}c${number}`, chapterNumber: `Chapter ${number}`, name: `Chapter ${number}`, banglaName: number === 1 ? "ভৌত জগৎ ও পরিমাপ" : "ভেক্টর", shortDescription: "", class: "Class 11", group: "Science", subject: "Physics", nctbBookName: "Physics" })),
}));
const block = (id: string, day = 3, start = "17:00", paper = 1): RoutineBlock => ({
  id, dayOfWeek: day, title: `Physics-${paper}: Ch-2`, subjectId: `physics${paper}`, chapterId: `p${paper}c2`, startTime: start, endTime: "18:00", color: "cyan",
});
const today = "2026-09-16"; // Wednesday, expressed in local calendar time.
const now = new Date(2026, 8, 16, 18, 0);
const source = block("source");
const task: DailyRoutineTask = { date: today, block: source, ...describeRoutineTask(source, subjects, []), completed: false };

test("legacy chapter labels and exact paper identity resolve without guessing", () => {
  assert.equal(resolveRoutineChapter({ ...source, subjectId: undefined, chapterId: undefined }, subjects)?.chapter.id, "p1c2");
  assert.equal(resolveRoutineChapter({ ...source, chapterId: "missing" }, subjects), null);
  const duplicate = { ...subjects[0], id: "ambiguous" };
  assert.equal(resolveRoutineChapter({ ...source, subjectId: undefined, chapterId: undefined }, [...subjects, duplicate]), null);
});

test("completion survives reload and routine edits, and new sessions start without dated homework details", () => {
  const records = parseDailyRoutineTasks(JSON.stringify(setDailyRoutineCompletion([], task, true)));
  const edited = { ...source, chapterId: "p1c1", title: "Physics-1: Ch-1", startTime: "21:00" };
  const displayed = getDailyRoutineTasks(today, [edited], records, subjects, []);
  assert.equal(displayed[0].block.chapterId, "p1c2");
  assert.equal(displayed[0].block.startTime, "17:00");
  assert.equal(displayed[0].completed, true);
  const undone = setDailyRoutineCompletion(records, displayed[0], false);
  assert.equal(getDailyRoutineTasks(today, [edited], undone, subjects, [])[0].block.chapterId, "p1c2");
  assert.equal(undone[0].completed, false);
  assert.equal(setDailyRoutineCompletion(undone, task, true).length, 1);
  const nextWeek = getDailyRoutineTasks("2026-09-23", [edited], records, subjects, []);
  assert.equal(nextWeek[0].completed, false);
  assert.equal(nextWeek[0].block.chapterId, undefined);
});

test("deleting or moving a recurring block retains its recorded session only on the original date", () => {
  const records = setDailyRoutineCompletion([], task, true);
  assert.equal(getDailyRoutineTasks(today, [], records, subjects, []).length, 1);
  assert.equal(getDailyRoutineTasks("2026-09-17", [], records, subjects, []).length, 0);
});

test("next task prefers later today in the same paper, excluding passed and already completed sessions", () => {
  const later = block("later", 3, "20:00");
  const tomorrow = block("tomorrow", 4);
  const blocks = [source, block("other-paper", 3, "19:00", 2), block("passed", 3, "16:00"), tomorrow, later];
  assert.equal(findNextRoutineTask(task, blocks, subjects, [], [], now)?.block.id, "later");
  const completedLater = { ...task, block: later, completed: true };
  assert.equal(findNextRoutineTask(task, blocks, subjects, [], [completedLater], now)?.block.id, "tomorrow");
});

test("falls back to the same routine next week without changing saved day or time", () => {
  const next = findNextRoutineTask(task, [source], subjects, [], [], now)!;
  assert.equal(next.block.id, source.id);
  assert.equal(localDateKey(next.startsAt), "2026-09-23");
  assert.equal(next.startsAt.getHours(), 17);
  assert.deepEqual(next.block, source);
});

test("early completion cannot select the same occurrence or a slot preceding the source", () => {
  const result = findNextRoutineTask(task, [source, block("earlier", 3, "16:00"), block("later", 3, "19:00")], subjects, [], [], new Date(2026, 8, 16, 12));
  assert.equal(result?.block.id, "later");
});

test("cross-midnight sessions use their starting date and find the next future session", () => {
  const overnight: DailyRoutineTask = { ...task, block: { ...source, startTime: "23:30", endTime: "00:30" } };
  const tomorrow = block("after-midnight", 4, "01:00");
  const result = findNextRoutineTask(overnight, [overnight.block, tomorrow], subjects, [], [], new Date(2026, 8, 17, 0, 30));
  assert.equal(result?.block.id, "after-midnight");
  assert.equal(localDateKey(result!.startsAt), "2026-09-17");
});

test("custom subjects match their own routines; removed routines fail safely", () => {
  const additional = [{ id: "cs50", name: "CS50", active: true, createdAt: "2026-09-16" }];
  const custom = { ...source, id: "custom", title: "CS50", subjectId: undefined, chapterId: undefined };
  const customTask = { ...task, block: custom, ...describeRoutineTask(custom, subjects, additional) };
  assert.equal(customTask.subjectKey, "additional:cs50");
  assert.equal(customTask.paletteColor, "amber");
  assert.equal(findNextRoutineTask(customTask, [custom], subjects, additional, [], now)?.block.id, "custom");
  assert.equal(findNextRoutineTask(customTask, [source], subjects, additional, [], now), null);
});

test("saved data validation rejects malformed rows and invalid dates", () => {
  assert.deepEqual(parseDailyRoutineTasks(null), []);
  assert.equal(parseDailyRoutineTasks(JSON.stringify([task, null, { ...task, date: "2026-02-31" }, { ...task, block: { ...source, startTime: "99:00" } }])).length, 1);
  assert.throws(() => parseDailyRoutineTasks("{}"));
});
