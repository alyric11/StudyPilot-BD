import { useState } from "react";
import { ArrowLeft, Atom, Beaker, BookOpen, Calculator, Check, ChevronRight, Dna, Laptop } from "lucide-react";
import type { Chapter, Subject } from "../data/curriculum";
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock, SubjectProgressMap } from "../types";
import { getChapterProgressPercentage } from "../utils/studyProgress";
import { getStudyLogTasks, localDateKey } from "../utils/routineTasks";
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
  onSetRoutineCompletion: (task: DailyRoutineTask, completed: boolean) => boolean;
}

type ChapterFilter = "all" | "started" | "notStarted" | "revised";

export default function SubjectPaperPage({
  subject, subjects, additionalSubjects, routineBlocks, dailyRoutineTasks,
  mastery, chapterProgress, onBack, onSelectChapter, onSetRoutineCompletion,
}: SubjectPaperPageProps) {
  const [chapterFilter, setChapterFilter] = useState<ChapterFilter>("all");
  const subjectClass = subject.chapters[0]?.class ?? "";
  const name = `${subject.name} ${subject.banglaName}`.toLowerCase();
  const SubjectIcon = name.includes("physics") ? Atom
    : name.includes("chemistry") ? Beaker
    : name.includes("biology") ? Dna
    : name.includes("math") ? Calculator
    : name.includes("ict") || name.includes("information") ? Laptop : BookOpen;

  const chapters = subject.chapters.map((chapter, index) => ({
    chapter,
    number: index + 1,
    percentage: getChapterProgressPercentage(chapterProgress[chapter.id]),
  }));
  const counts = {
    all: chapters.length,
    started: chapters.filter(({ percentage }) => percentage > 0 && percentage < 100).length,
    notStarted: chapters.filter(({ percentage }) => percentage === 0).length,
    revised: chapters.filter(({ percentage }) => percentage === 100).length,
  };
  const filters: { key: ChapterFilter; label: string }[] = [
    { key: "all", label: "All" }, { key: "started", label: "Started" },
    { key: "notStarted", label: "Not started" }, { key: "revised", label: "Revised" },
  ];
  const visible = chapters.filter(({ percentage }) =>
    chapterFilter === "started" ? percentage > 0 && percentage < 100
      : chapterFilter === "notStarted" ? percentage === 0
      : chapterFilter === "revised" ? percentage === 100 : true
  );
  const hasSections = chapters.some(({ chapter }) => Boolean(chapter.section));
  const sections = hasSections
    ? Array.from(new Set(chapters.map(({ chapter }) => chapter.section || "Other chapters")))
    : ["Chapters"];
  const todaysHomework = getStudyLogTasks(
    localDateKey(new Date()), routineBlocks, dailyRoutineTasks, subjects, additionalSubjects
  ).filter((task) => task.subjectKey === `subject:${subject.id}`
    && !task.completed && Boolean(task.block.chapterId || task.block.homeworkText?.trim()));

  return (
    <div className="subject-page subject-overview space-y-4">
      <header className="subject-panel subject-overview-header rounded-2xl border bg-white p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onBack} aria-label="Go back to subjects"
            className="shrink-0 cursor-pointer rounded-xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="subject-icon hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex">
            <SubjectIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {subjectClass && <span className="subject-badge inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold">{subjectClass}</span>}
            <h1 className="mt-1 break-words text-xl font-bold leading-snug text-slate-800">{subject.banglaName || subject.name}</h1>
            {subject.banglaName && subject.banglaName !== subject.name && (
              <p className="mt-0.5 text-sm text-slate-500">{subject.name}</p>
            )}
          </div>
        </div>
        <div className="subject-overview-progress">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs">
            <span className="font-medium text-slate-600">Subject progress</span>
            <span className="font-semibold text-slate-800">{mastery}%</span>
          </div>
          <div role="progressbar" aria-label="Subject progress" aria-valuenow={mastery} aria-valuemin={0} aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="subject-progress-fill h-full rounded-full" style={{ width: `${mastery}%` }} />
          </div>
        </div>
      </header>

      {todaysHomework.length > 0 && (
        <a href="#subject-study-log" className="subject-homework-summary subject-panel flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm text-slate-700">
          <span>Today: {todaysHomework.length} pending homework {todaysHomework.length === 1 ? "task" : "tasks"}</span>
          <span className="subject-accent-text shrink-0 text-xs font-semibold">View homework ↓</span>
        </a>
      )}

      <div className="subject-overview-columns">
        <section aria-labelledby="subject-chapters-heading" className="subject-panel min-w-0 rounded-2xl border bg-white p-4 sm:p-5">
          <h2 id="subject-chapters-heading" className="text-base font-bold text-slate-800">Chapters</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Select a chapter to continue studying.</p>
          <div role="group" aria-label="Filter chapters" className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
            {filters.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setChapterFilter(key)} aria-pressed={chapterFilter === key}
                className="subject-filter min-h-9 cursor-pointer rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors">
                {label} ({counts[key]})
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">{visible.length} chapters shown</p>
          {visible.length > 0 ? (
            <div className="mt-4 space-y-5">
              {sections.map((section) => {
                const sectionChapters = visible.filter(({ chapter }) => !hasSections || (chapter.section || "Other chapters") === section);
                if (!sectionChapters.length) return null;
                return (
                  <section key={section}>
                    {hasSections && <h3 className="mb-2 text-sm font-semibold text-slate-600">{section}</h3>}
                    <div className="rounded-xl border border-slate-100">
                      {sectionChapters.map(({ chapter, number, percentage }) => (
                        <button key={chapter.id} type="button" onClick={() => onSelectChapter(chapter)}
                          className="subject-chapter subject-chapter-row group w-full cursor-pointer border-b border-slate-100 px-3 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl last:border-b-0">
                          <span className="subject-chapter-number flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">{number}</span>
                          <span className="subject-chapter-name min-w-0 break-words text-sm font-semibold leading-relaxed text-slate-800">{chapter.banglaName || chapter.name}</span>
                          <span className="subject-chapter-status text-xs text-slate-500">
                            {percentage === 0 ? "Not started" : percentage === 100 ? (
                              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 subject-accent-text" aria-hidden="true" />Completed</span>
                            ) : (
                              <span className="flex items-center justify-end gap-2">
                                <span className="subject-row-progress h-1.5 w-16 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                                  <span className="subject-progress-fill block h-full rounded-full" style={{ width: `${percentage}%` }} />
                                </span>
                                <span>{percentage}%</span>
                              </span>
                            )}
                          </span>
                          <ChevronRight className="subject-chapter-chevron h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="py-7 text-center">
              <p className="text-sm text-slate-500">No chapters match this filter.</p>
              <button type="button" onClick={() => setChapterFilter("all")} className="subject-accent-text mt-3 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50">Show all chapters</button>
            </div>
          )}
        </section>

        <div id="subject-study-log" tabIndex={-1} className="min-w-0 scroll-mt-24 rounded-2xl">
          <SubjectStudyLog subject={subject} subjects={subjects} additionalSubjects={additionalSubjects}
            routineBlocks={routineBlocks} records={dailyRoutineTasks} onSetCompletion={onSetRoutineCompletion} />
        </div>
      </div>
    </div>
  );
}
