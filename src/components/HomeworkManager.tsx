import React, { useRef, useState } from "react";
import { Check, ClipboardList, Pencil, Plus, Trash2, X } from "lucide-react";
import type {
  Homework,
  AdditionalSubject,
  DailyRoutineTask,
  RoutineBlock,
} from "../types";
import type { Subject } from "../data/curriculum";
import {
  activeHomework,
  homeworkGroups,
  homeworkSubjectKey,
  homeworkSlot,
  linkedHomework,
  parseHomeworkSlot,
} from "../utils/homeworkBoard";
import { getScheduledRoutineTasks, localDateKey } from "../utils/routineTasks";
import { getSubjectCardStyles } from "../colorPalettes";
import { personalSubjectAppearance } from "../utils/personalSubjectAppearance";
import { formatTimeRange } from "../utils/time";
import useDialogFocus from "../hooks/useDialogFocus";
import PlannerReveal from "./PlannerReveal";
interface Props {
  subjects: Subject[];
  additionalSubjects: AdditionalSubject[];
  homeworks: Homework[];
  routineBlocks: RoutineBlock[];
  dailyRoutineTasks: DailyRoutineTask[];
  onAddHomework: (row: Omit<Homework, "id" | "completed">) => boolean;
  onUpdateHomework: (id: string, row: Partial<Homework>) => boolean;
  onToggleHomework: (id: string) => boolean;
  onDeleteHomework: (id: string) => boolean;
  onPlanHomework: (
    id: string,
    date: string,
    routineId: string,
    linked: boolean,
  ) => boolean;
  onOpenPlanner: () => void;
  onOpenChapter: (subjectId: string, chapterId: string) => void;
}
const blank = {
  subjectKey: "",
  subject: "",
  task: "",
  chapter: "",
  chapterId: "",
  deadline: "",
  source: "",
  remaining: "",
  notes: "",
};
const button =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500";
const input =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-500";
const dateLabel = (key: string) => {
  if (!key) return "No due date";
  const now = new Date(),
    next = new Date(now);
  next.setDate(next.getDate() + 1);
  if (key === localDateKey(now)) return "Today";
  if (key === localDateKey(next)) return "Tomorrow";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
export default function HomeworkManager(props: Props) {
  const { subjects, additionalSubjects, homeworks } = props;
  const [editing, setEditing] = useState<string | null>(null),
    [draft, setDraft] = useState(blank),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("");
  const [planning, setPlanning] = useState<string | null>(null),
    [week, setWeek] = useState(0),
    [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false),
    [doneOpen, setDoneOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = () => {
    setEditing(null);
    setPlanning(null);
    setDeleteId(null);
  };
  useDialogFocus(Boolean(editing || planning || deleteId), dialog, close);
  const choices = [
    ...subjects.map((s) => ({ key: `subject:${s.id}`, name: s.name })),
    ...additionalSubjects.map((s) => ({
      key: `additional:${s.id}`,
      name: s.name,
    })),
  ];
  const keyFor = (row: Homework) =>
    homeworkSubjectKey(row, subjects, additionalSubjects);
  const startEdit = (row?: Homework) => {
    setError("");
    setDetailsOpen(Boolean(row));
    setEditing(row?.id ?? "new");
    setDraft(
      row
        ? {
            subjectKey: keyFor(row),
            subject: row.subject,
            task: row.task,
            chapter: row.chapter,
            chapterId: row.chapterId || "",
            deadline: row.deadline,
            source: row.source || "",
            remaining: row.remaining || "",
            notes: row.notes || "",
          }
        : blank,
    );
  };
  const selectedSubject = subjects.find(
    (s) => draft.subjectKey === `subject:${s.id}`,
  );
  const update = (key: keyof typeof blank, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.subject.trim() || !draft.task.trim()) {
      setError("Choose a subject and enter what to do.");
      return;
    }
    if (
      [draft.task, draft.remaining, draft.notes].some(
        (text) => text.length > 5000,
      )
    ) {
      setError("Each instruction or note can contain up to 5,000 characters.");
      return;
    }
    const row = {
      ...draft,
      subjectKey: draft.subjectKey || undefined,
      chapterId: draft.chapterId || undefined,
      task: draft.task.trim(),
      priority:
        homeworks.find((row) => row.id === editing)?.priority ||
        ("medium" as const),
    };
    const saved =
      editing === "new"
        ? props.onAddHomework(row)
        : props.onUpdateHomework(editing!, row);
    if (saved) setEditing(null);
    else setError("Could not save. Your draft is still here; please retry.");
  };
  const groups = homeworkGroups(
    homeworks.filter((row) => !filter || keyFor(row) === filter),
  );
  const planningRow = activeHomework(homeworks).find(
    (row) => row.id === planning,
  );
  const slots: DailyRoutineTask[] = [];
  if (planningRow)
    for (let day = week * 7; day < week * 7 + 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      for (const task of getScheduledRoutineTasks(
        localDateKey(date),
        props.routineBlocks,
        props.dailyRoutineTasks,
        subjects,
        additionalSubjects,
      )) {
        const start = new Date(date),
          [h, m] = task.block.startTime.split(":").map(Number);
        start.setHours(h, m, 0, 0);
        if (task.subjectKey === keyFor(planningRow) && start > new Date())
          slots.push(task);
      }
    }
  const card = (row: Homework) => {
    const key = keyFor(row),
      curriculum = subjects.find((s) => key === `subject:${s.id}`),
      personal = additionalSubjects.find((s) => key === `additional:${s.id}`),
      appearance =
        personal && personalSubjectAppearance(personal.name, personal.icon);
    return (
      <article
        key={row.id}
        className={`rounded-xl border p-4 ${curriculum ? getSubjectCardStyles(curriculum.color).card : "border-slate-200 bg-slate-50/50"}`}
        style={
          appearance
            ? {
                backgroundColor: appearance.tint,
                borderColor: appearance.border,
              }
            : undefined
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {curriculum?.name || personal?.name || row.subject}
          </span>
          <span>{dateLabel(row.deadline)}</span>
        </div>
        <p
          className={`mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed ${row.completed ? "text-slate-500" : "text-slate-800"}`}
        >
          {row.task}
        </p>
        {row.source && (
          <p className="mt-2 break-words text-xs text-slate-500">
            From: {row.source}
          </p>
        )}
        {row.chapter && row.chapter !== "General" && (
          <p className="mt-1 break-words text-xs text-slate-500">
            {row.chapter}
          </p>
        )}
        {row.remaining && (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
            Remaining: {row.remaining}
          </p>
        )}
        {row.notes && (
          <p className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-500">
            {row.notes}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={button}
            onClick={() => props.onToggleHomework(row.id)}
          >
            <Check size={13} className="mr-1 inline" />
            {row.completed ? "Undo done" : "Done"}
          </button>
          <button className={button} onClick={() => startEdit(row)}>
            <Pencil size={13} className="mr-1 inline" />
            Edit
          </button>
          {!row.completed && (
            <button
              className={button}
              onClick={() => {
                setWeek(0);
                setError("");
                setPlanning(row.id);
              }}
            >
              Plan time
            </button>
          )}
          {curriculum?.chapters.some((ch) => ch.id === row.chapterId) && (
            <button
              className={button}
              onClick={() => props.onOpenChapter(curriculum.id, row.chapterId!)}
            >
              Open chapter
            </button>
          )}
          <button
            className={button}
            aria-label={`Delete homework: ${row.task}`}
            onClick={() => {
              setError("");
              setDeleteId(row.id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </article>
    );
  };
  return (
    <section
      id="homework-manager-root"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <ClipboardList className="text-indigo-500" />
            Homework Board
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            What is left to finish, and when will you work on it?
          </p>
        </div>
        <button className={button} onClick={() => startEdit()}>
          <Plus size={14} className="mr-1 inline" />
          Add homework
        </button>
      </header>
      <label className="mt-5 block text-xs text-slate-600">
        Filter by subject
        <select
          className={input}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">All subjects</option>
          {choices.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-5 space-y-5">
        {Object.entries(groups)
          .filter(([name]) => name !== "Done")
          .map(
            ([name, rows]) =>
              rows.length > 0 && (
                <section key={name}>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">
                    {name} · {rows.length}
                  </h3>
                  <div className="space-y-3">{rows.map(card)}</div>
                </section>
              ),
          )}
        {!Object.values(groups).some((rows) => rows.length) && (
          <p className="py-8 text-center text-sm text-slate-500">
            No homework here yet. Add work here or on a routine card.
          </p>
        )}
        {groups.Done.length > 0 && (
          <section>
            <button
              aria-expanded={doneOpen}
              className="w-full rounded-lg bg-slate-50 p-3 text-left text-sm font-semibold text-slate-600"
              onClick={() => setDoneOpen(!doneOpen)}
            >
              Done · {groups.Done.length}
            </button>
            <PlannerReveal open={doneOpen}>
              <div className="mt-3 space-y-3">{groups.Done.map(card)}</div>
            </PlannerReveal>
          </section>
        )}
      </div>
      {(editing || planning || deleteId) && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/25 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="homework-dialog-title"
            tabIndex={-1}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                id="homework-dialog-title"
                className="text-base font-semibold text-slate-800"
              >
                {editing
                  ? editing === "new"
                    ? "Add homework"
                    : "Edit homework"
                  : deleteId
                    ? "Delete homework?"
                    : "Plan study time"}
              </h3>
              <button className={button} aria-label="Close" onClick={close}>
                <X size={16} />
              </button>
            </div>
            {error && (
              <p role="alert" className="mb-3 text-sm text-rose-600">
                {error}
              </p>
            )}
            {editing && (
              <form onSubmit={save} className="space-y-3">
                <label className="block text-xs font-medium text-slate-600">
                  Subject
                  <select
                    aria-label="Subject"
                    className={input}
                    value={draft.subjectKey}
                    onChange={(event) => {
                      const selected = choices.find(
                        (s) => s.key === event.target.value,
                      );
                      setDraft((current) => ({
                        ...current,
                        subjectKey: event.target.value,
                        subject:
                          selected?.name ||
                          (event.target.value ? current.subject : ""),
                        chapter: "",
                        chapterId: "",
                      }));
                    }}
                  >
                    <option value="">
                      {draft.subjectKey
                        ? "Choose subject"
                        : draft.subject || "Choose subject"}
                    </option>
                    {draft.subjectKey &&
                      !choices.some(
                        (choice) => choice.key === draft.subjectKey,
                      ) && (
                        <option value={draft.subjectKey}>
                          {draft.subject}
                        </option>
                      )}
                    {choices.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                {editing !== "new" &&
                  homeworks.some(
                    (row) =>
                      row.id === editing &&
                      keyFor(row) !== draft.subjectKey &&
                      Object.values(row.sessions || {}).some(Boolean),
                  ) && (
                    <p className="text-xs text-slate-500">
                      Changing subject will unlink its study sessions. The
                      homework stays on the Board.
                    </p>
                  )}
                <label className="block text-xs font-medium text-slate-600">
                  What to do
                  <textarea
                    required
                    rows={3}
                    maxLength={5000}
                    className={input}
                    value={draft.task}
                    onChange={(event) => update("task", event.target.value)}
                    placeholder="CQ ৩–৪, অঙ্ক ৫–১০, finish practical notebook…"
                  />
                </label>
                <button
                  type="button"
                  aria-expanded={detailsOpen}
                  className="py-2 text-xs font-medium text-indigo-600"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                >
                  More details (optional)
                </button>
                <PlannerReveal open={detailsOpen}>
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs text-slate-600">
                      Due date
                      <input
                        type="date"
                        className={input}
                        value={draft.deadline}
                        onChange={(event) =>
                          update("deadline", event.target.value)
                        }
                      />
                    </label>
                    <label className="block text-xs text-slate-600">
                      From whom
                      <input
                        maxLength={5000}
                        className={input}
                        value={draft.source}
                        onChange={(event) =>
                          update("source", event.target.value)
                        }
                        placeholder="School, coaching, or teacher's name"
                      />
                    </label>
                    <label className="block text-xs text-slate-600">
                      Chapter
                      {selectedSubject ? (
                        <select
                          className={input}
                          value={draft.chapterId}
                          onChange={(event) => {
                            const ch = selectedSubject.chapters.find(
                              (ch) => ch.id === event.target.value,
                            );
                            setDraft((current) => ({
                              ...current,
                              chapterId: event.target.value,
                              chapter: ch?.banglaName || "",
                            }));
                          }}
                        >
                          <option value="">
                            {draft.chapter || "No linked chapter"}
                          </option>
                          {selectedSubject.chapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.banglaName || ch.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={input}
                          value={draft.chapter}
                          onChange={(event) =>
                            update("chapter", event.target.value)
                          }
                        />
                      )}
                    </label>
                    <label className="block text-xs text-slate-600">
                      Remaining work
                      <textarea
                        rows={2}
                        maxLength={5000}
                        className={input}
                        value={draft.remaining}
                        onChange={(event) =>
                          update("remaining", event.target.value)
                        }
                        placeholder="৩ হয়েছে, ৪ বাকি"
                      />
                    </label>
                    <label className="block text-xs text-slate-600">
                      Notes
                      <textarea
                        rows={2}
                        maxLength={5000}
                        className={input}
                        value={draft.notes}
                        onChange={(event) =>
                          update("notes", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </PlannerReveal>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white"
                >
                  Save homework
                </button>
              </form>
            )}
            {deleteId && (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  Delete this assignment from the Board and unlink it from its
                  study sessions? Your routine stays.
                </p>
                <button
                  className={button}
                  onClick={() => {
                    if (props.onDeleteHomework(deleteId)) setDeleteId(null);
                    else setError("Could not delete. Please retry.");
                  }}
                >
                  Delete homework
                </button>
              </>
            )}
            {planningRow && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Choose a study slot. This does not change the due date.
                </p>
                {!keyFor(planningRow) && (
                  <p className="text-sm text-slate-600">
                    Edit this homework and choose its subject before planning
                    time.
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <button
                    disabled={week === 0}
                    className={button}
                    onClick={() => setWeek(week - 1)}
                  >
                    Earlier
                  </button>
                  <span className="text-xs text-slate-500">
                    {week === 0
                      ? "Next 7 days"
                      : `Days ${week * 7 + 1}–${week * 7 + 7}`}
                  </span>
                  <button className={button} onClick={() => setWeek(week + 1)}>
                    Later
                  </button>
                </div>
                {slots.map((task) => {
                  const occupied = linkedHomework(
                      homeworks,
                      task.date,
                      task.block.id,
                    ),
                    own = occupied?.id === planningRow.id;
                  return (
                    <button
                      key={homeworkSlot(task.date, task.block.id)}
                      disabled={Boolean(occupied && !own) || task.completed}
                      className={`${button} flex w-full justify-between gap-2 text-left disabled:opacity-50`}
                      onClick={() => {
                        if (
                          !props.onPlanHomework(
                            planningRow.id,
                            task.date,
                            task.block.id,
                            !own,
                          )
                        )
                          setError("Could not update the plan. Please retry.");
                      }}
                    >
                      <span>
                        {dateLabel(task.date)} ·{" "}
                        {formatTimeRange(
                          task.block.startTime,
                          task.block.endTime,
                        )}
                      </span>
                      <span>
                        {task.completed
                          ? "Session done"
                          : own
                            ? "Unlink"
                            : occupied
                              ? "Occupied"
                              : "Plan here"}
                      </span>
                    </button>
                  );
                })}
                {!slots.length && (
                  <p className="text-sm text-slate-500">
                    No suitable study slots in these dates. Create one in Daily
                    Planner or view later dates.
                  </p>
                )}
                {Object.entries(planningRow.sessions || {})
                  .filter(([, linked]) => linked)
                  .map(([slot]) => {
                    const identity = parseHomeworkSlot(slot);
                    if (!identity) return null;
                    const [date, id] = identity,
                      block = props.routineBlocks.find(
                        (block) => block.id === id,
                      ),
                      weekday = new Date(`${date}T12:00`).getDay();
                    return (
                      <div
                        key={slot}
                        className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500"
                      >
                        <span>
                          Planned: {dateLabel(date)} ·{" "}
                          {block && block.dayOfWeek === weekday
                            ? block.title
                            : "No longer scheduled"}
                        </span>
                        <button
                          className={button}
                          onClick={() => {
                            if (
                              !props.onPlanHomework(
                                planningRow.id,
                                date,
                                id,
                                false,
                              )
                            )
                              setError("Could not unlink. Please retry.");
                          }}
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })}
                <button
                  className={button}
                  onClick={() => {
                    setPlanning(null);
                    props.onOpenPlanner();
                  }}
                >
                  Open Daily Planner
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
