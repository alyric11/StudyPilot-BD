import type { RoutineBlock } from '../types';

export const bangladeshDateKey = (now = new Date()) => new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 10);
export function sessionTone(date: string, completed: boolean, block: RoutineBlock, today: string) {
  if (date === today && completed) return 'completed-today';
  if (date < today && !completed && Boolean(block.chapterId || block.homeworkText?.trim())) return 'unfinished';
  return 'subject';
}
