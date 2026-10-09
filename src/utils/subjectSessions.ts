import type { Subject } from "../data/curriculum";
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock } from "../types";
import { describeRoutineTask, getScheduledRoutineTasks, localDateKey } from "./routineTasks.ts";

/** Scheduled occurrences after today, including slots without homework. */
export function upcomingSubjectSessions(subjectId: string, blocks: RoutineBlock[], records: DailyRoutineTask[],
  subjects: Subject[], additionalSubjects: AdditionalSubject[], now = new Date(), limit = 6): DailyRoutineTask[] {
  if (limit <= 0) return [];
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const candidates: DailyRoutineTask[] = [];
  for (const block of blocks) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + (block.dayOfWeek - date.getDay() + 7) % 7);
    let found = 0;
    // Dated exceptions can change subject identity. Once past those exceptions,
    // ordinary weekly slots suffice to find the requested number of occurrences.
    for (let attempt = 0; attempt < records.length + limit && found < limit; attempt++, date.setDate(date.getDate() + 7)) {
      const task = getScheduledRoutineTasks(localDateKey(date), [block], records, subjects, additionalSubjects)[0];
      if (task?.subjectKey !== `subject:${subjectId}`) continue;
      candidates.push(task);
      found++;
    }
  }
  return candidates.sort((a, b) => a.date.localeCompare(b.date) || a.block.startTime.localeCompare(b.block.startTime) || a.block.id.localeCompare(b.block.id)).slice(0, limit);
}

/** Find one future occurrence, retaining dated homework and ignoring deleted slots. */
export function nextSubjectSession(subjectId: string, blocks: RoutineBlock[], records: DailyRoutineTask[],
  subjects: Subject[], additionalSubjects: AdditionalSubject[], now = new Date()): DailyRoutineTask | null {
  const key = `subject:${subjectId}`;
  const candidates: { task: DailyRoutineTask; start: number }[] = [];
  for (const block of blocks) {
    if (describeRoutineTask(block, subjects, additionalSubjects).subjectKey !== key) continue;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(date.getDate() + (block.dayOfWeek - date.getDay() + 7) % 7);
    // Only saved exceptions can invalidate later weeks, so this bound always
    // reaches an ordinary future occurrence without scanning an arbitrary horizon.
    for (let attempt = 0; attempt < records.length + 2; attempt++, date.setDate(date.getDate() + 7)) {
      const task = getScheduledRoutineTasks(localDateKey(date), [block], records, subjects, additionalSubjects)[0];
      if (!task || task.completed || task.subjectKey !== key) continue;
      const [hour, minute] = task.block.startTime.split(":").map(Number);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute).getTime();
      if (start <= now.getTime()) continue;
      candidates.push({ task, start });
      break;
    }
  }
  candidates.sort((a, b) => a.start - b.start || a.task.block.id.localeCompare(b.task.block.id));
  return candidates[0]?.task ?? null;
}
