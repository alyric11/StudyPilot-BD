import test from "node:test";
import assert from "node:assert/strict";
import type { DailyRoutineTask, Homework, RoutineBlock } from "../types";
import type { Subject } from "../data/curriculum";
import { activeHomework, homeworkForRoutineSave, homeworkGroups, homeworkRoutineRecords, homeworkSlot, homeworkSubjectKey, linkedHomework, migrateHomework, parseHomework, persistHomeworkRecords, planHomework } from "./homeworkBoard";
import { createAccountStorage } from "./accountStorage";
import { getDailyRoutineTasks, localDateKey, setDailyRoutineCompletion } from "./routineTasks";
import { applyPatch, diffRecords, recordsForKey, restoreRecords } from "./cloudRecords";

const subject = { id: "physics", name: "Physics 2nd Paper", color: "cyan", chapters: [] } as Subject;
const block: RoutineBlock = { id: "slot", title: "Physics-2", subjectId: "physics", dayOfWeek: 3, startTime: "18:00", endTime: "19:00" };
const session: DailyRoutineTask = { date: "2026-10-07", block: { ...block, homeworkText: "CQ ৩–৪", chapterId: "static" }, subjectKey: "subject:physics", subjectName: subject.name, chapterBanglaName: "স্থির তড়িৎ", paletteColor: "cyan", completed: true };
const assignment: Homework = { id: "old-board-id", subject: subject.name, chapter: "Old chapter", task: "অঙ্ক ৫–১০\nKeep original instruction", deadline: "2026-10-08", priority: "high", completed: true, notes: "Original note" };
const raw = JSON.stringify;
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); }, clear: () => values.clear() };
}

test("migration preserves legacy Board fields and historical routine instructions without guessing a deadline or completion", () => {
  const before = raw([assignment, session]);
  const rows = migrateHomework([assignment], [session, { ...session, date: "2026-10-08", block: { ...block, chapterId: "only-chapter" } }]);
  assert.deepEqual(rows[0], assignment);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].task, session.block.homeworkText);
  assert.equal(rows[1].chapterId, "static");
  assert.equal(rows[1].deadline, "");
  assert.equal(rows[1].completed, false);
  assert.equal(rows[1].sessions?.[homeworkSlot(session.date, block.id)], true);
  assert.equal(raw([assignment, session]), before);
  assert.deepEqual(migrateHomework(rows, [session]), rows);
  assert.deepEqual(migrateHomework([assignment], [session]), rows);
});

test("unlink and assignment deletion suppress legacy resurrection while leaving the assignment or routine intact", () => {
  const imported = migrateHomework([], [session]);
  const unlinked = planHomework(imported, imported[0].id, session.date, block.id, false);
  assert.equal(activeHomework(unlinked).length, 1);
  assert.equal(linkedHomework(unlinked, session.date, block.id), undefined);
  assert.deepEqual(migrateHomework(unlinked, [session]), unlinked);
  assert.equal(homeworkRoutineRecords(unlinked, [session], [], [], [])[0].block.homeworkText, undefined);
  const deleted = imported.map(row => ({ ...row, deleted: true }));
  assert.equal(activeHomework(deleted).length, 0);
  assert.deepEqual(migrateHomework(deleted, [session]), deleted);
  assert.equal(homeworkRoutineRecords(deleted, [session], [], [], [])[0].completed, true);
  assert.equal(session.block.homeworkText, "CQ ৩–৪");
});

test("one assignment planned twice stays one pending item; occupied slots cannot be overwritten", () => {
  const row = { ...assignment, completed: false, subjectKey: "subject:physics" };
  let rows = planHomework([row, { ...row, id: "other" }], row.id, "2026-10-07", block.id, true);
  rows = planHomework(rows, row.id, "2026-10-14", block.id, true);
  assert.equal(activeHomework(rows).length, 2);
  assert.equal(Object.values(rows[0].sessions!).filter(Boolean).length, 2);
  assert.equal(homeworkGroups(rows, "2026-10-08").Today.length, 2);
  assert.throws(() => planHomework(rows, "other", "2026-10-14", block.id, true), /already has homework/);
  assert.throws(() => planHomework(rows, row.id, "2026-02-31", block.id, true), /invalid identity/);
  assert.deepEqual(homeworkGroups(rows, "2026-10-09")["Still pending"].map(item => item.id), ["old-board-id", "other"]);
});

test("canonical edits resolve onto both sessions without changing deadline, routine completion, or chapter progress", () => {
  const row = { ...migrateHomework([], [session])[0], task: "CQ ৩–৪ revised", remaining: "CQ ৪ বাকি", chapterId: "new-chapter", chapter: "New chapter", deadline: "2026-10-08", completed: true };
  const progress = { physics: { static: { readTextbook: false } } };
  const beforeProgress = raw(progress);
  const projected = homeworkRoutineRecords([row], [session], [block], [subject], []);
  assert.equal(projected[0].block.homeworkText, row.task);
  assert.equal(projected[0].block.chapterId, "new-chapter");
  assert.equal(projected[0].chapterBanglaName, "New chapter");
  assert.equal(projected[0].completed, true);
  const completedSession = setDailyRoutineCompletion(projected, projected[0], false);
  assert.equal(row.completed, true);
  assert.equal(completedSession[0].completed, false);
  assert.equal(row.deadline, "2026-10-08");
  assert.equal(raw(progress), beforeProgress);
  assert.equal(session.block.homeworkText, "CQ ৩–৪");
});

test("planning materializes only its dated occurrence, and deleting the weekly slot leaves homework readable", () => {
  const row = { ...assignment, completed: false, subjectKey: "subject:physics" };
  const rows = planHomework([row], row.id, "2026-10-07", block.id, true);
  const projected = homeworkRoutineRecords(rows, [], [block], [subject], []);
  assert.equal(projected.length, 1);
  assert.equal(projected[0].block.homeworkText, row.task);
  assert.equal(getDailyRoutineTasks("2026-10-14", [block], projected, [subject], [])[0].block.homeworkText, undefined);
  assert.equal(activeHomework(rows).length, 1);
  assert.equal(homeworkRoutineRecords(rows, projected, [], [subject], [])[0].block.homeworkText, row.task);
});

test("chapter-only context added after unlinking remains context and does not reimport homework", () => {
  const rows = migrateHomework([], [session]);
  const unlinked = planHomework(rows, rows[0].id, session.date, block.id, false);
  const chapterOnly = { ...session, block: { ...session.block, homeworkText: undefined, chapterId: "different-chapter" } };
  assert.equal(homeworkRoutineRecords(unlinked, [chapterOnly], [], [], [])[0].block.chapterId, "different-chapter");
  assert.deepEqual(migrateHomework(unlinked, [chapterOnly]), unlinked);
});

test("unlink undo restores only its permanent assignment ID, never a same-text assignment", () => {
  const slot = homeworkSlot(session.date, block.id);
  const first = { ...assignment, id: "first", sessions: { [slot]: false } };
  const second = { ...first, id: "second", completed: false };
  assert.equal(homeworkForRoutineSave([first, second], session.date, block.id), undefined);
  assert.equal(homeworkForRoutineSave([first, second], session.date, block.id, "second")?.id, "second");
  assert.throws(() => homeworkForRoutineSave([{ ...first, deleted: true }, second], session.date, block.id, "first"));
  assert.throws(() => homeworkForRoutineSave([first, { ...second, sessions: { [slot]: true } }], session.date, block.id, "first"));
});

test("local date groups include forgotten work, no-date work and collapsed completed work without duplicates", () => {
  const today = localDateKey(new Date(2026, 9, 8, 0, 1));
  const rows = [
    { ...assignment, id: "past", deadline: "2026-10-01", completed: false },
    { ...assignment, id: "today", deadline: today, completed: false },
    { ...assignment, id: "future", deadline: "2026-10-09", completed: false },
    { ...assignment, id: "none", deadline: "", completed: false },
    { ...assignment, id: "done", deadline: "2026-10-01" },
    { ...assignment, id: "deleted", deleted: true },
  ];
  const groups = homeworkGroups(rows, today);
  assert.deepEqual(Object.keys(groups), ["Still pending", "Today", "Upcoming", "No date", "Done"]);
  assert.deepEqual(Object.values(groups).map(group => group.map(row => row.id)), [["past"], ["today"], ["future"], ["none"], ["done"]]);
});

test("subjects use stable identity or a unique exact label, never fuzzy or ambiguous matching", () => {
  const personal = [{ id: "ka", name: "KA Math", createdAt: "2026-10-08" }];
  assert.equal(homeworkSubjectKey({ ...assignment, subject: "KA Math" }, [subject], personal), "additional:ka");
  assert.equal(homeworkSubjectKey({ ...assignment, subject: "Physics" }, [subject], personal), "");
  assert.equal(homeworkSubjectKey(assignment, [subject], [{ ...personal[0], name: subject.name }]), "");
  assert.equal(homeworkSubjectKey({ ...assignment, subjectKey: "additional:removed" }, [], []), "additional:removed");
  assert.equal(parseHomework(raw([{ ...assignment, subject: "Deleted coaching subject" }]))[0].subject, "Deleted coaching subject");
});

test("failed or interrupted migration preserves originals and account backup, then retries without duplicates", () => {
  const base = memoryStorage();
  const storage = createAccountStorage(base, "student");
  storage.setItem("sp_homework", raw([assignment]));
  storage.setItem("sp_daily_routine_tasks", raw([session]));
  const write = storage.setItem;
  storage.setItem = () => { throw new Error("Storage full"); };
  assert.throws(() => persistHomeworkRecords(storage, [assignment], [session]), /Storage full/);
  assert.equal(storage.getItem("sp_homework"), raw([assignment]));
  assert.equal(storage.getItem("sp_daily_routine_tasks"), raw([session]));
  const backup = base.getItem("studypilot:user:student:__homework_backup");
  assert.deepEqual(JSON.parse(backup!), { homework: raw([assignment]), routines: raw([session]) });
  storage.setItem = write;
  const first = persistHomeworkRecords(storage, [assignment], [session]);
  assert.deepEqual(persistHomeworkRecords(storage, first, [session]), first);
  assert.equal(base.getItem("studypilot:user:student:__homework_backup"), backup);
  assert.equal(createAccountStorage(base, "another").getItem("__homework_backup"), null);
});

test("backup failure and unreadable originals block saving without erasing data or losing a draft", () => {
  const base = memoryStorage(), storage = createAccountStorage(base, "student");
  storage.setItem("sp_homework", raw([assignment]));
  storage.backupHomework = () => { throw new Error("Backup failed"); };
  assert.throws(() => persistHomeworkRecords(storage, [assignment], [session]), /Backup failed/);
  assert.equal(storage.getItem("sp_homework"), raw([assignment]));
  storage.setItem("sp_homework", "unreadable original");
  assert.throws(() => persistHomeworkRecords(storage, [], [session]));
  assert.equal(storage.getItem("sp_homework"), "unreadable original");
  assert.throws(() => parseHomework(raw([{ ...assignment, sessions: { invalid: true } }])));
  assert.throws(() => parseHomework(raw([assignment, assignment])));
});

test("homework, multi-session links and unlink/delete history round-trip through existing cloud records", () => {
  const row = { ...assignment, completed: false, sessions: { [homeworkSlot("2026-10-07", "slot")]: false, [homeworkSlot("2026-10-14", "slot")]: true } };
  const original = raw([row]);
  const records = recordsForKey("sp_homework", original);
  assert.deepEqual(parseHomework(restoreRecords(records.values()).sp_homework), [row]);
  const textEdit = diffRecords("sp_homework", original, raw([{ ...row, remaining: "CQ ৪ বাকি" }]));
  const linkEdit = diffRecords("sp_homework", original, raw(planHomework([row], row.id, "2026-10-21", "slot", true)));
  for (const patches of [textEdit, linkEdit]) patches.forEach((patch, id) => records.set(id, applyPatch(records.get(id), patch)));
  const restored = parseHomework(restoreRecords(records.values()).sp_homework);
  assert.equal(restored[0].remaining, "CQ ৪ বাকি");
  assert.equal(restored[0].sessions?.[homeworkSlot("2026-10-07", "slot")], false);
  assert.equal(Object.values(restored[0].sessions!).filter(Boolean).length, 2);
  const deleted = raw(restored.map(row => ({ ...row, deleted: true })));
  diffRecords("sp_homework", raw(restored), deleted).forEach((patch, id) => records.set(id, applyPatch(records.get(id), patch)));
  const refreshed = parseHomework(restoreRecords(records.values()).sp_homework);
  assert.equal(activeHomework(refreshed).length, 0);
  assert.deepEqual(migrateHomework(refreshed, [session]), refreshed);
  assert.equal(diffRecords("sp_homework", deleted, deleted).size, 0);
});

test("long Bengali instructions and notes fit existing cloud record limits", () => {
  const text = "বাংলা".repeat(1000);
  const patches = diffRecords("sp_homework", null, raw([{ ...assignment, task: text, notes: text, remaining: text, source: text }]));
  assert.ok([...patches.values()].every(patch => raw(patch).length < 200000));
  assert.equal(parseHomework(restoreRecords(recordsForKey("sp_homework", raw([{ ...assignment, task: text }])).values()).sp_homework)[0].task, text);
});
