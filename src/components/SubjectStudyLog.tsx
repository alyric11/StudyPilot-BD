import { useEffect, useState, type CSSProperties } from "react";
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
    resolveRoutineChapter,
} from "../utils/routineTasks.ts";
import { formatTime12Hour } from "../utils/time";
import { getSubjectAccentColor, getSubjectCardStyles } from '../colorPalettes';
import UpcomingSubjectSessions from './UpcomingSubjectSessions';

interface SubjectStudyLogProps {
    subject: Subject;
    subjects: Subject[];
    additionalSubjects: AdditionalSubject[];
    routineBlocks: RoutineBlock[];
    records: DailyRoutineTask[];
    onOpenPlanner: (task?: DailyRoutineTask) => void;
    onSaveDatedRoutineTask: (task: DailyRoutineTask) => boolean;
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
    onSetCompletion,
    onSaveDatedRoutineTask,
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
                        {viewedDate === today ? "Today's Session" : formatSelectedDate(viewedDate)}
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
                    tasks.map((task) => {
                        const chapter = resolveRoutineChapter(task.block, subjects)?.chapter;
                        return (
                        <div
                            key={`${task.date}:${task.block.id}`}
                            className={`subject-log-task subject-card-live ${viewedDate === today ? 'subject-log-task-today' : ''} ${getSubjectCardStyles(task.paletteColor).card}`}
                            style={{ '--subject-hover-color': getSubjectAccentColor(task.paletteColor) } as CSSProperties}
                        >
                            <div className="subject-log-card-layout">
                                <div className="subject-log-time" aria-label={`${formatTime12Hour(task.block.startTime)} to ${formatTime12Hour(task.block.endTime)}${task.block.endTime <= task.block.startTime ? ', ends next day' : ''}`}>
                                    <span>{formatTime12Hour(task.block.startTime)}</span>
                                    <span>{formatTime12Hour(task.block.endTime)}{task.block.endTime <= task.block.startTime && <sup title="Ends the next day">+1</sup>}</span>
                                </div>
                                <div className="contents">
                                    <p
                                        className={`subject-log-chapter min-w-0 break-words text-sm font-semibold ${task.completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {chapter && <span className="subject-log-chapter-number">{chapter.chapterNumber}</span>}
                                        <span>{chapter ? chapter.banglaName || chapter.name : task.block.title}</span>
                                    </p>

                                    <p
                                        className="subject-log-homework-copy min-w-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600"
                                    >
                                        {task.block.homeworkText?.trim() || "No homework assigned"}
                                    </p>
                                </div>

                                <label className={`subject-log-check ${chapter ? 'has-chapter' : ''} flex h-7 w-8 cursor-pointer items-center justify-center`}>
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
                        </div>
                    ); })
                ) : (
                    <div className="px-1 py-1">
                        <p className="text-xs leading-relaxed text-slate-500">
                            No tasks for this subject on this date.
                        </p>
                    </div>
                )}
            </div>
            <UpcomingSubjectSessions subject={subject} subjects={subjects} additionalSubjects={additionalSubjects}
                routineBlocks={routineBlocks} records={records} now={now} onSave={onSaveDatedRoutineTask} />
        </aside>
    );
}
