import assert from "node:assert/strict";
import { test } from "node:test";

import { class12Subjects } from "../data/class12";
import type { ChapterProgress } from "../types";
import { getStudyProgress } from "./studyProgress";

const done: ChapterProgress = {
  readOverview: true,
  watchedIntroVideo: true,
  readTextbook: true,
  watchedLectures: true,
  solvedExercises: true,
  solvedBoardQuestions: true,
  madeNotes: true,
  timedExams: true,
  revisionCompleted: true,
};

const bangla = class12Subjects("Science").find(
  (subject) => subject.id === "bangla_1",
)!;

test("chapter revisions cannot overflow section totals", () => {
  const saved = Object.fromEntries(
    bangla.chapters
      .slice(0, 5)
      .map((chapter) => [chapter.id, done]),
  );

  const result = getStudyProgress(bangla, saved);

  assert.equal(result.revised, 5);
  assert.equal(result.totalUnits, 4);
  assert.equal(result.revisedUnits, 0);
  assert.equal(result.percentage, 20);
});

test("a unit is revised only when every chapter in that unit is revised", () => {
  const saved = Object.fromEntries(
    bangla.chapters
      .filter((chapter) => chapter.section === "গদ্য")
      .map((chapter) => [chapter.id, done]),
  );

  assert.equal(getStudyProgress(bangla, saved).revisedUnits, 1);
});

test("missing records count as incomplete and stale records do not inflate progress", () => {
  assert.equal(getStudyProgress(bangla).percentage, 0);

  assert.equal(
    getStudyProgress(bangla, { stale: done }).percentage,
    0,
  );

  const all = Object.fromEntries(
    bangla.chapters.map((chapter) => [chapter.id, done]),
  );

  assert.equal(getStudyProgress(bangla, all).percentage, 100);
  assert.equal(getStudyProgress(bangla, all).revisedUnits, 4);
});