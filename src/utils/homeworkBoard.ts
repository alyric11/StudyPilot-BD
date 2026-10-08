import type {
  Homework,
  DailyRoutineTask,
  RoutineBlock,
  AdditionalSubject,
} from "../types";
import type { Subject } from "../data/curriculum";
import { getDailyRoutineTasks, localDateKey } from "./routineTasks";
import type { StudentStorage } from "./accountStorage";

export const homeworkSlot = (date: string, routineId: string) =>
  JSON.stringify([date, routineId]);
export function parseHomeworkSlot(slot: string): [string, string] | null {
  try {
    const value: unknown = JSON.parse(slot);
    if (
      !Array.isArray(value) ||
      value.length !== 2 ||
      !value.every((item) => typeof item === "string")
    )
      return null;
    const [date, id] = value;
    const [year, month, day] = date.split("-").map(Number);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      localDateKey(new Date(year, month - 1, day)) === date &&
      id
      ? [date, id]
      : null;
  } catch {
    return null;
  }
}

// Reject unreadable collections as a whole. Never replace them with an empty list.
export function parseHomework(raw: string | null): Homework[] {
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    value.some(
      (row) =>
        !row ||
        typeof row !== "object" ||
        ![row.id, row.subject, row.task, row.chapter, row.deadline].every(
          (item) => typeof item === "string",
        ) ||
        !row.id ||
        typeof row.completed !== "boolean" ||
        ![row.deleted, row.imported].every(
          (item) => item === undefined || typeof item === "boolean",
        ) ||
        ![
          row.subjectKey,
          row.chapterId,
          row.source,
          row.remaining,
          row.notes,
        ].every((item) => item === undefined || typeof item === "string") ||
        (row.sessions !== undefined &&
          (!row.sessions ||
            typeof row.sessions !== "object" ||
            Array.isArray(row.sessions) ||
            Object.entries(row.sessions).some(
              ([key, flag]) =>
                !parseHomeworkSlot(key) || typeof flag !== "boolean",
            ))),
    )
  ) {
    throw new Error("Homework records could not be read safely.");
  }
  if (new Set(value.map((row) => row.id)).size !== value.length)
    throw new Error("Homework identities are duplicated.");
  return value;
}
export const activeHomework = (rows: Homework[]) =>
  rows.filter((row) => !row.deleted);
export const linkedHomework = (
  rows: Homework[],
  date: string,
  routineId: string,
) =>
  activeHomework(rows).find(
    (row) => row.sessions?.[homeworkSlot(date, routineId)] === true,
  );

export function homeworkForRoutineSave(
  rows: Homework[],
  date: string,
  routineId: string,
  restoreId?: string,
): Homework | undefined {
  const current = linkedHomework(rows, date, routineId);
  if (!restoreId) return current;
  const previous = rows.find(
    (row) =>
      row.id === restoreId &&
      !row.deleted &&
      Object.hasOwn(row.sessions || {}, homeworkSlot(date, routineId)),
  );
  if (!previous || (current && current.id !== restoreId))
    throw new Error(
      "This homework can no longer be restored to the session. Use Homework Board to review it.",
    );
  return previous;
}

export function homeworkSubjectKey(
  row: Homework,
  subjects: Subject[],
  personal: AdditionalSubject[],
): string {
  if (row.subjectKey) return row.subjectKey;
  const matches = [
    ...subjects.map((subject) => ({
      name: subject.name,
      key: `subject:${subject.id}`,
    })),
    ...personal.map((subject) => ({
      name: subject.name,
      key: `additional:${subject.id}`,
    })),
  ].filter((subject) => subject.name === row.subject);
  return matches.length === 1 ? matches[0].key : "";
}

export function migrateHomework(
  rows: Homework[],
  records: DailyRoutineTask[],
): Homework[] {
  const result = [...rows];
  for (const record of records) {
    if (!record.block.homeworkText?.trim()) continue;
    const slot = homeworkSlot(record.date, record.block.id);
    const id = `routine_hw_${encodeURIComponent(slot)}`;
    if (
      result.some(
        (row) => row.id === id || Object.hasOwn(row.sessions ?? {}, slot),
      )
    )
      continue;
    result.push({
      id,
      subject: record.subjectName,
      subjectKey: record.subjectKey ?? undefined,
      chapter: record.chapterBanglaName,
      chapterId: record.block.chapterId,
      task: record.block.homeworkText,
      deadline: "",
      priority: "medium",
      completed: false,
      sessions: { [slot]: true },
      imported: true,
    });
  }
  return result.length === rows.length ? rows : result;
}

export function persistHomeworkRecords(
  storage: StudentStorage,
  rows: Homework[],
  records: DailyRoutineTask[],
): Homework[] {
  // This also prevents an unreadable original from being overwritten by a draft.
  parseHomework(storage.getItem("sp_homework"));
  const migrated = migrateHomework(rows, records);
  if (!storage.backupHomework)
    throw new Error("Homework saving requires an account-scoped backup.");
  storage.backupHomework();
  storage.setItem("sp_homework", JSON.stringify(migrated));
  return migrated;
}

// Resolve canonical assignments onto session views. Original dated data stays recoverable.
export function homeworkRoutineRecords(
  rows: Homework[],
  records: DailyRoutineTask[],
  blocks: RoutineBlock[],
  subjects: Subject[],
  personal: AdditionalSubject[],
): DailyRoutineTask[] {
  const result = new Map(
    records.map((record) => [
      homeworkSlot(record.date, record.block.id),
      record,
    ]),
  );
  for (const row of rows)
    for (const [slot, linked] of Object.entries(row.sessions ?? {})) {
      if (!linked || row.deleted || result.has(slot)) continue;
      const identity = parseHomeworkSlot(slot);
      if (!identity) continue;
      const [date, id] = identity;
      const task = getDailyRoutineTasks(
        date,
        blocks,
        records,
        subjects,
        personal,
      ).find((task) => task.block.id === id);
      if (task) result.set(slot, task);
    }
  return [...result.values()].map((record) => {
    const slot = homeworkSlot(record.date, record.block.id);
    if (!rows.some((row) => Object.hasOwn(row.sessions ?? {}, slot)))
      return record;
    const homework = linkedHomework(rows, record.date, record.block.id);
    return {
      ...record,
      chapterBanglaName: homework?.chapter || record.chapterBanglaName,
      block: {
        ...record.block,
        homeworkText: homework?.task,
        // A chapter-only session edited after unlinking is still valid context.
        // Legacy instructions stay suppressed by the retained link history.
        chapterId: homework
          ? homework.chapterId
          : record.block.homeworkText
            ? undefined
            : record.block.chapterId,
      },
    };
  });
}

export function planHomework(
  rows: Homework[],
  id: string,
  date: string,
  routineId: string,
  linked: boolean,
): Homework[] {
  const slot = homeworkSlot(date, routineId);
  if (!parseHomeworkSlot(slot))
    throw new Error("This study session has an invalid identity.");
  const occupied = linkedHomework(rows, date, routineId);
  if (linked && occupied && occupied.id !== id)
    throw new Error(
      "This study session already has homework. Choose another session.",
    );
  if (!rows.some((row) => row.id === id && !row.deleted))
    throw new Error("Homework is no longer available.");
  return rows.map((row) =>
    row.id === id
      ? { ...row, sessions: { ...row.sessions, [slot]: linked } }
      : row,
  );
}

export function homeworkGroups(
  rows: Homework[],
  today = localDateKey(new Date()),
) {
  const groups: Record<string, Homework[]> = {
    "Still pending": [],
    Today: [],
    Upcoming: [],
    "No date": [],
    Done: [],
  };
  for (const row of activeHomework(rows)) {
    const group = row.completed
      ? "Done"
      : !row.deadline
        ? "No date"
        : row.deadline < today
          ? "Still pending"
          : row.deadline === today
            ? "Today"
            : "Upcoming";
    groups[group].push(row);
  }
  for (const group of Object.values(groups))
    group.sort(
      (a, b) =>
        a.deadline.localeCompare(b.deadline) || a.id.localeCompare(b.id),
    );
  return groups;
}
