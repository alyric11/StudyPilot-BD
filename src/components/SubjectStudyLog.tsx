import { useState } from "react";
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

interface SubjectStudyLogProps {
    subject: Subject;
    subjects: Subject[];
    additionalSubjects: AdditionalSubject[];
    routineBlocks: RoutineBlock[];
    records: DailyRoutineTask[];
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
}: SubjectStudyLogProps) {
    const [selectedDate, setSelectedDate] = useState(
        () => localDateKey(new Date())
    );

    const subjectKey = `subject:${subject.id}`;

    const tasks = getStudyLogTasks(
        selectedDate,
        routineBlocks,
        records,
        subjects,
        additionalSubjects
    ).filter((task) => task.subjectKey === subjectKey);

    return (
        <aside className="subject-panel rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="subject-icon rounded-lg bg-sky-50 p-2 text-sky-700">
                    <CalendarDays className="h-4 w-4" />
                </div>

                <h2 className="text-base font-bold text-slate-800">
                    Study Log
                </h2>
            </div>

            {/* Date navigation */}
            <div className="subject-log-date mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-1">
                <button
                    type="button"
                    onClick={() =>
                        setSelectedDate((current) => shiftDate(current, -1))
                    }
                    className="subject-log-nav flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-indigo-600"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <label className="relative flex min-h-10 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg focus-within:ring-2 focus-within:ring-slate-400">
                    <span className="text-sm font-semibold text-slate-700">
                        {formatSelectedDate(selectedDate)}
                    </span>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => {
                            if (event.target.value) {
                                setSelectedDate(event.target.value);
                            }
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label="Choose study log date"
                    />
                </label>

                <button
                    type="button"
                    onClick={() =>
                        setSelectedDate((current) => shiftDate(current, 1))
                    }
                    className="subject-log-nav flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-indigo-600"
                    aria-label="Next day"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Subject tasks */}
            <div className="mt-4 space-y-2.5">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={`${task.date}:${task.block.id}`}
                            className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                        >
                            <div className="mb-2 text-xs font-medium text-slate-500">
                                    {formatTime12Hour(task.block.startTime)}
                                    {" – "}{formatTime12Hour(task.block.endTime)}
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-sm font-semibold ${task.completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {task.chapterBanglaName || task.block.title}
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
        </aside>
    );
}
