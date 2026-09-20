import { useState } from "react";
import {
  ArrowLeft,
  Atom,
  Beaker,
  BookOpen,
  Calculator,
  ChevronRight,
  Dna,
  Laptop,
} from "lucide-react";

import type { Chapter, Subject } from "../data/curriculum";
import type {
  AdditionalSubject,
  DailyRoutineTask,
  RoutineBlock,
  SubjectProgressMap,
} from "../types";

import { getChapterProgressPercentage } from "../utils/studyProgress";
import SubjectStudyLog from "./SubjectStudyLog";

interface SubjectPaperPageProps {
  subject: Subject;
  subjects: Subject[];
  additionalSubjects: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  dailyRoutineTasks: DailyRoutineTask[];
  mastery: number;
  chapterProgress: SubjectProgressMap;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  onSetRoutineCompletion: (
    task: DailyRoutineTask,
    completed: boolean
  ) => boolean;
}

type ChapterFilter =
  | "all"
  | "started"
  | "notStarted"
  | "revised";

export default function SubjectPaperPage({
  subject,
  subjects,
  additionalSubjects,
  routineBlocks,
  dailyRoutineTasks,
  mastery,
  chapterProgress,
  onBack,
  onSelectChapter,
  onSetRoutineCompletion,
}: SubjectPaperPageProps) {
  const [chapterFilter, setChapterFilter] =
    useState<ChapterFilter>("all");

  const hasSections = subject.chapters.some(
    (chapter) => chapter.section
  );

  const subjectClass =
    subject.chapters[0]?.class ?? "";

  const getSubjectIcon = () => {
    const subjectName =
      `${subject.name} ${subject.banglaName}`.toLowerCase();

    if (subjectName.includes("physics")) {
      return Atom;
    }

    if (subjectName.includes("chemistry")) {
      return Beaker;
    }

    if (subjectName.includes("biology")) {
      return Dna;
    }

    if (
      subjectName.includes("math") ||
      subjectName.includes("mathematics")
    ) {
      return Calculator;
    }

    if (
      subjectName.includes("ict") ||
      subjectName.includes("information")
    ) {
      return Laptop;
    }

    return BookOpen;
  };

  const SubjectIcon = getSubjectIcon();

  const chapterPercentages = subject.chapters.map(
    (chapter) => ({
      chapter,
      percentage: getChapterProgressPercentage(
        chapterProgress[chapter.id]
      ),
    })
  );

  const chapterCounts = {
    all: chapterPercentages.length,

    started: chapterPercentages.filter(
      ({ percentage }) =>
        percentage > 0 && percentage < 100
    ).length,

    notStarted: chapterPercentages.filter(
      ({ percentage }) => percentage === 0
    ).length,

    revised: chapterPercentages.filter(
      ({ percentage }) => percentage === 100
    ).length,
  };

  const sections = hasSections
    ? Array.from(
      new Set(
        subject.chapters
          .map((chapter) => chapter.section)
          .filter(
            (section): section is string =>
              Boolean(section)
          )
      )
    )
    : ["Chapters"];

  const getChaptersForSection = (
    section: string
  ) => {
    if (!hasSections) {
      return subject.chapters;
    }

    return subject.chapters.filter(
      (chapter) => chapter.section === section
    );
  };

  const chapterMatchesFilter = (
    chapter: Chapter
  ) => {
    const percentage =
      getChapterProgressPercentage(
        chapterProgress[chapter.id]
      );

    if (chapterFilter === "started") {
      return percentage > 0 && percentage < 100;
    }

    if (chapterFilter === "notStarted") {
      return percentage === 0;
    }

    if (chapterFilter === "revised") {
      return percentage === 100;
    }

    return true;
  };

  const hasVisibleChapters =
    subject.chapters.some(chapterMatchesFilter);

  const filterButtonClass = (
    filter: ChapterFilter
  ) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${chapterFilter === filter
      ? "bg-[#243247] text-white shadow-sm"
      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-4">
      {/* Subject header */}
      <div className="w-full space-y-3">
        {/* Top box: Back button + subject information */}
        <div className="w-full rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 cursor-pointer rounded-xl border border-slate-200 p-3 text-slate-500 transition-all hover:bg-slate-50 hover:text-[#243247]"
              title="Go Back"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            {/* Divider */}
            <div className="hidden h-16 w-px shrink-0 bg-slate-200 sm:block" />

            {/* Subject information */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#243247] sm:flex">
                <SubjectIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                {subjectClass && (
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#243247]">
                    {subjectClass}
                  </span>
                )}

                <h1 className="mt-1.5 break-words text-xl font-bold leading-tight text-[#243247] md:text-2xl">
                  {subject.banglaName}
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {subject.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom box: Filters + Subject Progress */}
        <div className="w-full rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Chapter filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setChapterFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${chapterFilter === "all"
                    ? "bg-[#243247] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                All ({chapterCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setChapterFilter("started")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${chapterFilter === "started"
                    ? "bg-[#243247] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                Started ({chapterCounts.started})
              </button>

              <button
                type="button"
                onClick={() => setChapterFilter("notStarted")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${chapterFilter === "notStarted"
                    ? "bg-[#243247] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                Not Started ({chapterCounts.notStarted})
              </button>

              <button
                type="button"
                onClick={() => setChapterFilter("revised")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${chapterFilter === "revised"
                    ? "bg-[#243247] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
              >
                Revised ({chapterCounts.revised})
              </button>
            </div>

            {/* Subject progress */}
            <div className="flex w-full shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-auto">
              <span className="whitespace-nowrap text-xs font-medium text-slate-600">
                Subject Progress:
              </span>

              <div className="h-2 min-w-20 flex-1 overflow-hidden rounded-full bg-slate-200 sm:w-24 sm:flex-none">
                <div
                  className="h-full rounded-full bg-[#243247] transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>

              <span className="w-9 text-right text-xs font-bold text-[#243247]">
                {mastery}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
        {/* Chapters */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm md:p-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#243247]">
                Chapters
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Select a chapter to open its
                StudyPilot learning center.
              </p>
            </div>

            {hasVisibleChapters ? (
              <div className="mt-4 space-y-6">
                {sections.map((section) => {
                  const chapters =
                    getChaptersForSection(
                      section
                    ).filter(
                      chapterMatchesFilter
                    );

                  if (chapters.length === 0) {
                    return null;
                  }

                  return (
                    <section key={section}>
                      {hasSections && (
                        <h3 className="mb-2 text-sm font-bold text-slate-600">
                          {section}
                        </h3>
                      )}

                      <div className="overflow-hidden rounded-xl border border-slate-100">
                        {chapters.map(
                          (chapter) => {
                            const chapterNumber =
                              subject.chapters.findIndex(
                                (item) =>
                                  item.id ===
                                  chapter.id
                              ) + 1;

                            const percentage =
                              getChapterProgressPercentage(
                                chapterProgress[
                                chapter.id
                                ]
                              );

                            return (
                              <button
                                type="button"
                                key={chapter.id}
                                onClick={() =>
                                  onSelectChapter(
                                    chapter
                                  )
                                }
                                className="group flex w-full items-center gap-4 border-b border-slate-100 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-slate-50 md:px-4"
                              >
                                {/* Chapter number */}
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-[#243247] ring-1 ring-inset ring-slate-300 transition-colors group-hover:bg-slate-100 group-hover:ring-slate-400">
                                  {chapterNumber}
                                </div>

                                {/* Chapter name */}
                                <span className="min-w-0 flex-1 text-sm font-semibold text-[#243247]">
                                  {
                                    chapter.banglaName
                                  }
                                </span>

                                {/* Desktop progress */}
                                <div className="hidden w-36 shrink-0 items-center gap-3 sm:flex lg:w-48">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-[#243247] transition-all duration-500"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="w-9 text-right text-xs font-semibold text-slate-500">
                                    {percentage}%
                                  </span>
                                </div>

                                {/* Mobile percentage */}
                                <span className="w-9 shrink-0 text-right text-xs font-semibold text-slate-500 sm:hidden">
                                  {percentage}%
                                </span>

                                <ChevronRight className="h-4 w-4 shrink-0 text-[#243247] transition-transform group-hover:translate-x-0.5" />
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No chapters match this filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Study log */}
        <div className="min-w-0">
          <SubjectStudyLog
            subject={subject}
            subjects={subjects}
            additionalSubjects={
              additionalSubjects
            }
            routineBlocks={routineBlocks}
            records={dailyRoutineTasks}
            onSetCompletion={
              onSetRoutineCompletion
            }
          />
        </div>
      </div>
    </div>
  );
}