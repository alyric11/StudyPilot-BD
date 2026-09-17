import type { Subject } from "../data/curriculum";
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock } from "../types";

export const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const dateFromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatRoutineSubjectName = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const paperIndex = words.findIndex((word) => /^(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th)$/i.test(word));
  if (paperIndex > 0) {
    const base = words.slice(0, paperIndex).map((word) => word.replace(/[^A-Za-z]/g, "")).filter(Boolean).join(" ");
    return `${base}-${words[paperIndex].replace(/\D/g, "")}`;
  }
  if (words.length === 1) return words[0];
  return words.map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase()).filter(Boolean).join("");
};

export const formatRoutineChapterNumber = (value: string) => {
  const trimmed = value.trim();
  if (/^(chapter|ch)[-\s]*/i.test(trimmed)) return trimmed.replace(/^(chapter|ch)[-\s]*/i, "Ch-");
  if (/^(lesson|less)[-\s]*/i.test(trimmed)) return trimmed.replace(/^(lesson|less)[-\s]*/i, "Less-");
  if (/^(question|ques)[-\s]*/i.test(trimmed)) return trimmed.replace(/^(question|ques)[-\s]*/i, "Ques-");
  return `Ch-${trimmed}`;
};

const titleSubject = (block: RoutineBlock) => block.title.split(":")[0].trim().toLowerCase();

export const resolveRoutineSubject = (block: RoutineBlock, subjects: Subject[]) => {
  if (block.subjectId) return subjects.find((subject) => subject.id === block.subjectId);
  const matches = subjects.filter((subject) =>
    formatRoutineSubjectName(subject.name).toLowerCase() === titleSubject(block)
  );
  // Legacy titles can be ambiguous. Never guess the wrong paper.
  return matches.length === 1 ? matches[0] : undefined;
};

export const resolveRoutineChapter = (block: RoutineBlock, subjects: Subject[]) => {
  const subject = resolveRoutineSubject(block, subjects);
  if (!subject) return null;
  const chapterLabel = block.title.split(":").slice(1).join(":").trim().toLowerCase();
  const chapter = block.chapterId
    ? subject.chapters.find((item) => item.id === block.chapterId)
    : subject.chapters.find((item) => formatRoutineChapterNumber(item.chapterNumber).toLowerCase() === chapterLabel);
  return chapter ? { subject, chapter } : null;
};

export const describeRoutineTask = (
  block: RoutineBlock,
  subjects: Subject[],
  additionalSubjects: AdditionalSubject[]
) => {
  const subject = resolveRoutineSubject(block, subjects);
  const chapter = resolveRoutineChapter(block, subjects)?.chapter;
  const additionalMatches = additionalSubjects.filter((item) =>
    block.subjectId === item.id || (!block.subjectId && formatRoutineSubjectName(item.name).toLowerCase() === titleSubject(block))
  );
  const additional = additionalMatches.length === 1 ? additionalMatches[0] : undefined;
  return {
    subjectKey: subject ? `subject:${subject.id}` : additional ? `additional:${additional.id}` : null,
    subjectName: subject?.name ?? additional?.name ?? block.title.split(":")[0].trim(),
    chapterBanglaName: chapter?.banglaName ?? (subject ? "Chapter details unavailable" : "Custom activity"),
    paletteColor: subject?.color ?? (additional ? "amber" : block.color ?? "slate"),
  };
};

export const getDailyRoutineTasks = (
  date: string,
  blocks: RoutineBlock[],
  records: DailyRoutineTask[],
  subjects: Subject[],
  additionalSubjects: AdditionalSubject[]
): DailyRoutineTask[] => {
  const saved = records.filter((record) => record.date === date);
  const tasks = new Map(saved.map((record) => [record.block.id, record]));
  const dayOfWeek = dateFromKey(date).getDay();
  for (const block of blocks) {
    if (block.dayOfWeek === dayOfWeek && !tasks.has(block.id)) {
      tasks.set(block.id, { date, block: { ...block }, ...describeRoutineTask(block, subjects, additionalSubjects), completed: false });
    }
  }
  return [...tasks.values()].sort((a, b) => a.block.startTime.localeCompare(b.block.startTime) || a.block.id.localeCompare(b.block.id));
};

export const setDailyRoutineCompletion = (
  records: DailyRoutineTask[], task: DailyRoutineTask, completed: boolean
): DailyRoutineTask[] => {
  const existing = records.find((record) => record.date === task.date && record.block.id === task.block.id);
  // Keep the original snapshot even after undo; a future edit must not rewrite today.
  const updated = { ...(existing ?? task), block: { ...(existing ?? task).block }, completed };
  return [...records.filter((record) => !(record.date === task.date && record.block.id === task.block.id)), updated];
};

export const findNextRoutineTask = (
  task: DailyRoutineTask,
  blocks: RoutineBlock[],
  subjects: Subject[],
  additionalSubjects: AdditionalSubject[],
  records: DailyRoutineTask[],
  now = new Date()
) => {
  const sourceStart = dateFromKey(task.date);
  const [sourceHour, sourceMinute] = task.block.startTime.split(":").map(Number);
  sourceStart.setHours(sourceHour, sourceMinute, 0, 0);
  const threshold = Math.max(now.getTime(), sourceStart.getTime());
  const candidates = blocks.flatMap((block) => {
    const identity = describeRoutineTask(block, subjects, additionalSubjects).subjectKey;
    // A free-text activity can still prepare its own next weekly occurrence.
    if (task.subjectKey ? identity !== task.subjectKey : block.id !== task.block.id) return [];
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + (block.dayOfWeek - start.getDay() + 7) % 7);
    const [hour, minute] = block.startTime.split(":").map(Number);
    start.setHours(hour, minute, 0, 0);
    while (
      start.getTime() <= threshold ||
      (block.id === task.block.id && localDateKey(start) === task.date) ||
      records.some((record) => record.completed && record.date === localDateKey(start) && record.block.id === block.id)
    ) start.setDate(start.getDate() + 7);
    return [{ block, startsAt: start }];
  });
  return candidates.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.block.id.localeCompare(b.block.id))[0] ?? null;
};

export const parseDailyRoutineTasks = (raw: string | null): DailyRoutineTask[] => {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Invalid daily routine records");
  return parsed.filter((value): value is DailyRoutineTask => {
    if (!value || typeof value !== "object") return false;
    const block = value.block;
    return typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
      localDateKey(dateFromKey(value.date)) === value.date &&
      typeof value.completed === "boolean" &&
      (value.subjectKey === null || typeof value.subjectKey === "string") &&
      [value.subjectName, value.chapterBanglaName, value.paletteColor].every((item) => typeof item === "string") &&
      block && typeof block.id === "string" && typeof block.title === "string" &&
      Number.isInteger(block.dayOfWeek) && block.dayOfWeek >= 0 && block.dayOfWeek <= 6 &&
      [block.startTime, block.endTime].every((time) => typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) &&
      [block.subjectId, block.chapterId, block.color].every((item) => item === undefined || typeof item === "string");
  });
};
