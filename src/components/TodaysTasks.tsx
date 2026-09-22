import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, Check } from "lucide-react";
import { getSubjectAccentColor, getSubjectCardStyles } from "../colorPalettes";
import type { Subject } from "../data/curriculum";
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock } from "../types";
import { findNextRoutineTask, getDailyRoutineTasks, localDateKey, resolveRoutineChapter } from "../utils/routineTasks.ts";
import { formatTime12Hour, formatTimeRange } from "../utils/time";

interface TodaysTasksProps {
  subjects: Subject[];
  additionalSubjects: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  records: DailyRoutineTask[];
  onSetCompletion: (task: DailyRoutineTask, completed: boolean) => boolean;
  onOpenChapter: (subjectId: string, chapterId: string) => void;
  onEditRoutine: (routineId: string, occurrenceDate: string) => void;
  onOpenPlanner: () => void;
}

export default function TodaysTasks({
  subjects, additionalSubjects, routineBlocks, records,
  onSetCompletion, onOpenChapter, onEditRoutine, onOpenPlanner,
}: TodaysTasksProps) {
  const reduceMotion = useReducedMotion();
  const [today, setToday] = useState(() => localDateKey(new Date()));
  const [prompt, setPrompt] = useState<DailyRoutineTask | null>(null);
  const [promptError, setPromptError] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const promptAnchorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let timer: number;
    const updateDay = () => {
      const now = new Date();
      setToday(localDateKey(now));
      window.clearTimeout(timer);
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = window.setTimeout(updateDay, midnight.getTime() - now.getTime() + 50);
    };
    updateDay();
    window.addEventListener("focus", updateDay);
    document.addEventListener("visibilitychange", updateDay);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", updateDay);
      document.removeEventListener("visibilitychange", updateDay);
    };
  }, []);

  useEffect(() => { setPrompt(null); setPromptError(false); }, [today]);

  const closePrompt = (restoreFocus = false) => {
    setPrompt(null);
    setPromptError(false);
    if (restoreFocus) promptAnchorRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!prompt) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Another checkbox replaces the prompt in one update. Outside clicks still
      // perform their original action; dismissing never consumes the event.
      if (rootRef.current?.contains(target) &&
          (target.closest("[data-next-task-strip]") || target.closest("[data-task-checkbox]"))) return;
      closePrompt();
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closePrompt(true); }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onEscape);
    };
  }, [prompt]);

  const tasks = getDailyRoutineTasks(today, routineBlocks, records, subjects, additionalSubjects);
  const setNextTask = () => {
    if (!prompt) return;
    if (promptError) { closePrompt(); onOpenPlanner(); return; }
    const next = findNextRoutineTask(prompt, routineBlocks, subjects, additionalSubjects, records);
    if (!next) { setPromptError(true); return; }
    closePrompt();
    onEditRoutine(next.block.id, localDateKey(next.startsAt));
  };

  return (
    <section ref={rootRef} aria-labelledby="todays-tasks-heading" className="dashboard-panel today-tasks">
      <div className="dashboard-section-heading">
        <div className="rounded-lg bg-sky-50 p-2 text-sky-700"><CalendarDays className="h-4 w-4" aria-hidden="true" /></div>
        <h2 id="todays-tasks-heading">Today’s tasks</h2>
      </div>
      {tasks.length ? (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const styles = getSubjectCardStyles(task.paletteColor);
            const accent = getSubjectAccentColor(task.paletteColor);
            const { block } = task;
            const overnight = block.endTime <= block.startTime;
            const chapterLink = resolveRoutineChapter(block, subjects);
            const isOpen = prompt?.block.id === block.id;
            const promptId = `next-task-${block.id}`;
            return (
              <div key={block.id} data-today-routine-id={block.id} data-completed={task.completed}
                className={`today-task rounded-xl border ${styles.card}`}
                style={{ "--task-accent": accent } as CSSProperties}>
                <div className="today-task-content">
                  <div aria-label={`${formatTimeRange(block.startTime, block.endTime)}${overnight ? ", ends next day" : ""}`} className="today-task-time">
                    <span><span className="sr-only">Start: </span>{formatTime12Hour(block.startTime)}</span>
                    <span><span className="sr-only">End: </span>{formatTime12Hour(block.endTime)}{overnight && <sup title="Next day">+1</sup>}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="today-task-title">{block.title}</div>
                    {chapterLink ? (
                      <button type="button" lang="bn" onClick={() => onOpenChapter(chapterLink.subject.id, chapterLink.chapter.id)}
                        className="today-chapter-link" aria-label={`Open ${chapterLink.chapter.banglaName}`}>
                        {task.chapterBanglaName}
                      </button>
                    ) : <div className="today-chapter-name">{task.chapterBanglaName}</div>}
                  </div>
                  <label data-task-checkbox className="task-checkbox-target">
                    <input type="checkbox" checked={task.completed}
                      aria-label={`${task.completed ? "Mark incomplete" : "Mark done"}: ${block.title}, ${task.chapterBanglaName}, ${formatTimeRange(block.startTime, block.endTime)}`}
                      aria-controls={isOpen ? promptId : undefined}
                      onChange={(event) => {
                        const completed = event.currentTarget.checked;
                        if (!onSetCompletion(task, completed)) return;
                        setPromptError(false);
                        if (completed) {
                          promptAnchorRef.current = event.currentTarget;
                          setPrompt({ ...task, completed: true });
                        } else if (isOpen) closePrompt();
                      }} />
                    <span className="task-checkbox-mark" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                  </label>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="next-task" id={promptId} data-next-task-strip
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }} className="next-task-reveal">
                      <div className="next-task-strip">
                        <button type="button" className="next-task-action" onClick={setNextTask}>
                          {promptError ? "No upcoming routine. Open planner." : `Set the next ${task.subjectName} task.`}
                        </button>
                        <button type="button" className="next-task-later" onClick={() => closePrompt(true)}>Later</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-slate-600">No routine planned for today.</p>
          <button type="button" onClick={onOpenPlanner} className="dashboard-text-action mt-2">Create routine</button>
        </div>
      )}
    </section>
  );
}
