import type { Subject } from "../data/curriculum";
import type { ChapterProgress } from "../types";

export const CHAPTER_PREPARATION_KEYS = [
  "readOverview",
  "readTextbook", "watchedLectures", "solvedExercises",
  "solvedBoardQuestions", "madeNotes", "timedExams", "revisionCompleted",
] as const satisfies readonly (keyof ChapterProgress)[];

export function getChapterProgressPercentage(progress?: ChapterProgress) {
  if (!progress) {
    return 0;
  }

  const checked = CHAPTER_PREPARATION_KEYS.filter(
    (key) => progress[key] === true
  ).length;

  return Math.round((checked / CHAPTER_PREPARATION_KEYS.length) * 100);
}

// Count current curriculum entries, including those without saved progress.
// Old chapter records must not inflate the displayed percentage.
export function getStudyProgress(subject: Subject, progress: Record<string, ChapterProgress> = {}) {
  const total = subject.chapters.length;
  const checked = subject.chapters.reduce((sum, chapter) =>
    sum + CHAPTER_PREPARATION_KEYS.filter((key) => progress[chapter.id]?.[key] === true).length, 0);
  const revised = subject.chapters.filter((chapter) => progress[chapter.id]?.revisionCompleted).length;
  const sections = [...new Set(subject.chapters.map((chapter) => chapter.section).filter(Boolean))];
  const grouped = sections.length > 0 && subject.chapters.every((chapter) => Boolean(chapter.section));
  const revisedUnits = sections.filter((section) => subject.chapters
    .filter((chapter) => chapter.section === section)
    .every((chapter) => progress[chapter.id]?.revisionCompleted)).length;
  return {
    percentage: total ? Math.round(checked / (total * CHAPTER_PREPARATION_KEYS.length) * 100) : 0,
    revised,
    total,
    revisedUnits,
    totalUnits: grouped ? sections.length : 0,
  };
}
