import { Guidance } from "./InstructionLanguage";
import { useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import StudyPageHeader from "./StudyPageHeader";
import type { Chapter, Subject } from "../data/curriculum";
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock, SubjectProgressMap } from "../types";
import { CHAPTER_PREPARATION_KEYS, getChapterProgressPercentage, getStudyProgress } from "../utils/studyProgress";
import { getStudyPace } from "../utils/paceCalculator";
import SubjectStudyLog from "./SubjectStudyLog";
import DifficultPoints from "./DifficultPoints";
import { chapterRowNumber } from "../utils/subjectOutline";
import useDisclosureScroll from "../hooks/useDisclosureScroll";

interface SubjectPaperPageProps {
  subject: Subject;
  subjects: Subject[];
  additionalSubjects: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  dailyRoutineTasks: DailyRoutineTask[];
  mastery: number;
  chapterProgress: SubjectProgressMap;
  examYear: string;
  classLevel: string;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  onSetRoutineCompletion: (task: DailyRoutineTask, completed: boolean) => boolean;
  onOpenPlanner: (task?: DailyRoutineTask) => void;
}

type ChapterFilter = "all" | "started" | "notStarted" | "revised";

function OutlineSection({ title, count, itemLabel, open, onToggle, children }: {
  title: string; count: number; itemLabel: string; open: boolean;
  onToggle: () => void; children: ReactNode;
}) {
  const id = useId();
  const panelRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prepareScroll = useDisclosureScroll(open, panelRef, revealRef, contentRef);
  return <section ref={panelRef} className="subject-outline-section">
    <h3><button type="button" className="subject-section-toggle" aria-expanded={open} aria-controls={id}
      onClick={() => { prepareScroll(); onToggle(); }}>
      <span className="min-w-0 flex-1 break-words">{title}</span>
      <span className="subject-section-count">{count} {count === 1 ? itemLabel.slice(0, -1) : itemLabel}</span>
      <ChevronDown className="subject-section-chevron h-4 w-4 shrink-0" aria-hidden="true" />
    </button></h3>
    <div ref={revealRef} id={id} className="subject-section-reveal" data-expanded={open} inert={!open} aria-hidden={!open}>
      <div className="subject-section-clip"><div ref={contentRef} className="flow-root">{children}</div></div>
    </div>
  </section>;
}

export default function SubjectPaperPage(props: SubjectPaperPageProps) {
  return <SubjectPaperContent key={`${props.subject.chapters[0]?.class}:${props.subject.id}`} {...props} />;
}

function SubjectPaperContent({
  subject, subjects, additionalSubjects, routineBlocks, dailyRoutineTasks,
  mastery, chapterProgress, onBack, onSelectChapter, onSetRoutineCompletion, onOpenPlanner,
  examYear, classLevel,
}: SubjectPaperPageProps) {
  const [chapterFilter, setChapterFilter] = useState<ChapterFilter>("all");
  const [filterClosedSections, setFilterClosedSections] = useState<string[]>([]);
  const subjectClass = subject.chapters[0]?.class ?? "";
  const pace = getStudyPace({
    totalChapters: getStudyProgress(subject, chapterProgress).total,
    completedChapters: subject.chapters.filter(chapter =>
      CHAPTER_PREPARATION_KEYS.every(key => chapterProgress[chapter.id]?.[key] === true)).length,
    examYear, classLevel, today: new Date(),
  });

  const chapters = subject.chapters.map((chapter, index) => ({
    chapter,
    number: chapterRowNumber(chapter.chapterNumber, index + 1),
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
  const hasLessons = subject.chapters.some(chapter => /^Lesson\s/i.test(chapter.chapterNumber));
  const itemLabel = hasLessons ? "lessons" : "chapters";
  const [openSections, setOpenSections] = useState<string[]>([]);
  const selectFilter = (filter: ChapterFilter) => {
    setChapterFilter(filter);
    setFilterClosedSections([]);
  };
  const toggleSection = (section: string) => {
    if (chapterFilter !== "all") {
      setFilterClosedSections(current => current.includes(section) ? current.filter(value => value !== section) : [...current, section]);
      return;
    }
    const next = openSections.includes(section) ? openSections.filter(value => value !== section) : [...openSections, section];
    setOpenSections(next);
  };

  return (
    <div className="subject-page subject-overview space-y-4">
      <StudyPageHeader subjectName={subject.name} title={subject.name} banglaTitle={subject.banglaName}
        context={subjectClass || classLevel} onBack={onBack} backLabel="Go back to subjects">
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
      </StudyPageHeader>

      <div className="subject-overview-columns">
        <section aria-labelledby="subject-chapters-heading" className="subject-panel subject-chapters-panel min-w-0 rounded-2xl border bg-white p-4 sm:p-5">
          <div>
          <h2 id="subject-chapters-heading" className="text-base font-semibold text-slate-800">{hasLessons ? "Units & lessons" : "Chapters"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500"><Guidance>{hasSections ? "Expand a section and select an item to continue studying." : "Select a chapter to continue studying."}</Guidance></p>
          <div role="group" aria-label={`Filter ${itemLabel}`} className="mt-4 flex flex-wrap gap-1 border-b border-slate-100 pb-3">
            {filters.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => selectFilter(key)} aria-pressed={chapterFilter === key}
                className="subject-filter min-h-9 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors">
                {label} <span className="font-normal">({counts[key]})</span>
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">{visible.length} {itemLabel} match this filter</p>
          </div>
          <div>
          {visible.length > 0 ? (
            <div className="subject-outline-groups">
              {sections.map((section) => {
                const sectionChapters = visible.filter(({ chapter }) => !hasSections || (chapter.section || "Other chapters") === section);
                if (!sectionChapters.length) return null;
                const expanded = !hasSections || (chapterFilter === "all" ? openSections.includes(section) : !filterClosedSections.includes(section));
                const list = (
                    <div className="subject-chapter-list">
                      {sectionChapters.map(({ chapter, number, percentage }) => (
                        <button key={chapter.id} type="button" onClick={() => onSelectChapter(chapter)}
                          className="subject-chapter subject-chapter-row group w-full cursor-pointer border-b border-slate-100 px-3 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl last:border-b-0">
                          <span className="subject-chapter-number flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">{number}</span>
                          <span className="subject-chapter-name min-w-0 break-words text-sm font-medium leading-relaxed text-slate-800">{chapter.banglaName || chapter.name}</span>
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
                );
                return hasSections ? <OutlineSection key={section} title={section} count={sectionChapters.length}
                  itemLabel={itemLabel} open={expanded} onToggle={() => toggleSection(section)}>{list}</OutlineSection>
                  : <div key={section}>{list}</div>;
              })}
            </div>
          ) : (
            <div className="py-7 text-center">
              <p className="text-sm text-slate-500">No {itemLabel} match this filter.</p>
              <button type="button" onClick={() => selectFilter("all")} className="subject-accent-text mt-3 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50">Show all {itemLabel}</button>
            </div>
          )}
          </div>
        </section>

        <div className="subject-support-column">
          <div className="subject-panel subject-companion min-w-0 rounded-2xl border bg-white p-4 sm:p-5">
            <div id="subject-study-log" tabIndex={-1} className="min-w-0 scroll-mt-24 rounded-lg">
              <SubjectStudyLog subject={subject} subjects={subjects} additionalSubjects={additionalSubjects}
                routineBlocks={routineBlocks} records={dailyRoutineTasks} onSetCompletion={onSetRoutineCompletion} onOpenPlanner={onOpenPlanner} />
            </div>
          {pace && <section aria-labelledby="subject-pace-heading" className="mt-5 border-t border-slate-100 pt-5">
            <h3 id="subject-pace-heading" className="text-sm font-semibold text-slate-600">Study pace</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
              {pace.status === "ok" ? `About ${pace.chaptersPerWeek} chapters per week`
                : pace.status === "exam_soon" ? "Exam is close. Focus on revision and your weakest chapters."
                : pace.status === "exam_passed" ? "Your exam date has passed. Update your exam year in your profile."
                : "All chapters done! Use the time for revision and board questions."}
            </p>
            {pace.status === "ok" && <div className="mt-1 space-y-1 text-xs leading-relaxed text-slate-500">
              <p>{pace.remainingChapters} chapters left · {pace.weeksLeft} weeks to your estimated exam</p>
            </div>}
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {pace.status === "ok" && "Last 25% kept for revision. "}Estimated exam date. Adjust your pace to your school's routine.
            </p>
          </section>}
          </div>
        <DifficultPoints key={subject.id} subjectContext={{ subjectId: subject.id, subjectName: subject.name }} />
        </div>
      </div>
    </div>
  );
}
