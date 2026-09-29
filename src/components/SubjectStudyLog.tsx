import { useEffect, useState } from "react";
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import type { Subject } from "../data/curriculum";
import type {
    AdditionalSubject,
    DailyRoutineTask,
    RoutineBlock,
} from "../types";
import {
    getStudyLogTasks,
    localDateKey,
} from "../utils/routineTasks.ts";
import { formatTime12Hour } from "../utils/time";
import { nextSubjectSession } from "../utils/subjectSessions";

interface SubjectStudyLogProps {
    subject: Subject;
    subjects: Subject[];
    additionalSubjects: AdditionalSubject[];
    routineBlocks: RoutineBlock[];
    records: DailyRoutineTask[];
    onOpenPlanner: (task?: DailyRoutineTask) => void;
    onSetCompletion: (
        task: DailyRoutineTask,
        completed: boolean
    ) => boolean;
}

const shiftDate = (dateKey: string, amount: number) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + amount);

    return localDateKey(date);
};

const formatSelectedDate = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(date);
};

export default function SubjectStudyLog({
    subject,
    subjects,
    additionalSubjects,
    routineBlocks,
    records,
    onOpenPlanner,
    onSetCompletion,
}: SubjectStudyLogProps) {
    const [selectedDate, setSelectedDate] = useState(
        () => localDateKey(new Date())
    );
    const [now, setNow] = useState(() => new Date());
    const [followingToday, setFollowingToday] = useState(true);
    useEffect(() => {
        const refresh = () => setNow(new Date());
        const timer = window.setInterval(refresh, 30000);
        window.addEventListener("focus", refresh);
        return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
    }, []);
    const today = localDateKey(now);
    const viewedDate = followingToday ? today : selectedDate;
    const chooseDate = (date: string) => { setSelectedDate(date); setFollowingToday(date === today); };

    const subjectKey = `subject:${subject.id}`;

    const tasks = getStudyLogTasks(
        viewedDate,
        routineBlocks,
        records,
        subjects,
        additionalSubjects,
        today
    ).filter((task) => task.subjectKey === subjectKey);
    const next = nextSubjectSession(subject.id, routineBlocks, records, subjects, additionalSubjects, now);
    const isNext = (task: DailyRoutineTask) => !!next && next.date === task.date && next.block.id === task.block.id;
    const nextInList = tasks.some(isNext);
    const pendingToday = getStudyLogTasks(today, routineBlocks, records, subjects, additionalSubjects, today)
        .filter(task => task.subjectKey === subjectKey && !task.completed && Boolean(task.block.chapterId || task.block.homeworkText?.trim())).length;
    const tomorrow = shiftDate(today, 1);
    const nextLabel = next ? `${next.date === today ? "Today" : next.date === tomorrow ? "Tomorrow" : formatSelectedDate(next.date)}` : "";
    const nextChapter = next?.block.chapterId ? subject.chapters.find(chapter => chapter.id === next.block.chapterId) : undefined;

    return (
        <aside className="subject-study-log min-w-0" aria-labelledby="subject-study-log-heading">
            <div className="flex items-center gap-2">
                <div className="subject-icon rounded-lg bg-sky-50 p-2 text-sky-700">
                    <CalendarDays className="h-4 w-4" />
                </div>

                <h2 id="subject-study-log-heading" className="text-base font-semibold text-slate-800">
                    Study Log
                </h2>
            </div>
            {pendingToday > 0 && <button type="button" className="subject-log-homework" onClick={() => chooseDate(today)}>
                Today · {pendingToday} pending homework {pendingToday === 1 ? "task" : "tasks"}
            </button>}

            {/* Date navigation */}
            <div className="subject-log-date mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-1">
                <button
                    type="button"
                    onClick={() =>
                        chooseDate(shiftDate(viewedDate, -1))
                    }
                    className="subject-log-nav flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-indigo-600"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <label className="relative flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg focus-within:ring-2 focus-within:ring-slate-400">
                    <span className="text-sm font-semibold text-slate-700">
                        {formatSelectedDate(viewedDate)}
                    </span>

                    <input
                        type="date"
                        value={viewedDate}
                        onChange={(event) => {
                            if (event.target.value) {
                                chooseDate(event.target.value);
                            }
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label="Choose study log date"
                    />
                </label>

                <button
                    type="button"
                    onClick={() =>
                        chooseDate(shiftDate(viewedDate, 1))
                    }
                    className="subject-log-nav flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-indigo-600"
                    aria-label="Next day"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            {viewedDate !== today && <button type="button" className="subject-log-action mt-2" onClick={() => chooseDate(today)}>Back to today</button>}

            {/* Subject tasks */}
            <div className="mt-4 space-y-2.5">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={`${task.date}:${task.block.id}`}
                            className="subject-log-task"
                        >
                            {isNext(task) && <span className="subject-next-label">Next session</span>}
                            <div className="mb-2 text-xs font-medium text-slate-500">
                                    {formatTime12Hour(task.block.startTime)}
                                    {" – "}{formatTime12Hour(task.block.endTime)}
                                    {task.block.endTime <= task.block.startTime && " (+1 day)"}
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-sm font-semibold ${task.completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {(task.block.chapterId && subject.chapters.find(chapter => chapter.id === task.block.chapterId)?.banglaName) || task.block.title}
                                    </p>

                                    <p
                                        className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-500"
                                    >
                                        {task.block.homeworkText?.trim() || "No homework assigned"}
                                    </p>
                                </div>

                                <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        className="peer sr-only"
                                        onChange={(event) =>
                                            onSetCompletion(
                                                task,
                                                event.currentTarget.checked
                                            )
                                        }
                                        aria-label={`${task.completed
                                                ? "Mark incomplete"
                                                : "Mark complete"
                                            }: ${task.block.title}`}
                                    />

                                    <span className="subject-task-check flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors peer-checked:border-indigo-500 peer-checked:bg-indigo-500 peer-checked:text-white">
                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    </span>
                                </label>
                            </div>
                            {isNext(task) && <button type="button" className="subject-log-action mt-2" onClick={() => onOpenPlanner(task)}>Open in planner →</button>}
                        </div>
                    ))
                ) : (
                    <div className="px-1 py-1">
                        <p className="text-xs leading-relaxed text-slate-500">
                            No tasks for this subject on this date.
                        </p>
                    </div>
                )}
            </div>
            {!nextInList && <div className="subject-next-session">
                {next ? <>
                    <span className="subject-next-label">Next session</span>
                    <p className="text-xs leading-relaxed text-slate-500">{nextLabel} · {formatTime12Hour(next.block.startTime)}–{formatTime12Hour(next.block.endTime)}{next.block.endTime <= next.block.startTime && " (+1 day)"}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{nextChapter?.banglaName || nextChapter?.name || subject.name}</p>
                    <button type="button" className="subject-log-action mt-2" onClick={() => onOpenPlanner(next)}>Open in planner →</button>
                </> : <>
                    <p className="text-xs text-slate-500">No upcoming session scheduled.</p>
                    <button type="button" className="subject-log-action mt-2" onClick={() => onOpenPlanner()}>Plan a study session →</button>
                </>}
            </div>}
        </aside>
    );
}
