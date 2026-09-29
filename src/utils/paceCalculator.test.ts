import assert from "node:assert/strict";
import { test } from "node:test";
import { getStudyPace } from "./paceCalculator.ts";

const input = { totalChapters: 10, completedChapters: 3, examYear: "2027", classLevel: "Class 12", today: new Date(2027, 0, 1, 18) };

test("normal pace reserves 25% for revision and rounds up", () => {
  assert.deepEqual(getStudyPace(input), { status: "ok", remainingChapters: 7, weeksLeft: 12, studyWeeks: 9, chaptersPerWeek: 0.8 });
});
test("all chapters done takes priority", () => {
  assert.equal(getStudyPace({ ...input, completedChapters: 10, today: new Date(2027, 4, 1) })?.status, "all_done");
});
test("exam soon includes exam day without an infinite pace", () => {
  assert.equal(getStudyPace({ ...input, today: new Date(2027, 2, 20) })?.status, "exam_soon");
  const sameDay = getStudyPace({ ...input, today: new Date(2027, 3, 1, 23) })!;
  assert.equal(sameDay.status, "exam_soon");
  assert.equal(sameDay.chaptersPerWeek, 0);
});
test("past estimate returns exam_passed with zero weeks", () => {
  const result = getStudyPace({ ...input, today: new Date(2027, 3, 2) })!;
  assert.equal(result.status, "exam_passed");
  assert.equal(result.weeksLeft, 0);
});
test("invalid exam year returns null", () => {
  for (const examYear of ["abc", "", "NaN", "2027oops"]) assert.equal(getStudyPace({ ...input, examYear }), null);
});
test("SSC and HSC use their different estimated dates", () => {
  for (const classLevel of ["Class 9", "Class 10"]) assert.equal(getStudyPace({ ...input, classLevel })?.weeksLeft, 4);
  for (const classLevel of ["Class 11", "Class 12"]) assert.equal(getStudyPace({ ...input, classLevel })?.weeksLeft, 12);
});
