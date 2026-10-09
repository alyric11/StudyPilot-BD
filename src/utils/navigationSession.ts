import type { Subject } from '../data/curriculum';

export type AppSection = 'dashboard' | 'planner' | 'homework' | 'diary';
export interface NavigationSession {
  section: AppSection;
  subjectId: string | null;
  chapterId: string | null;
  videos: boolean;
}
export const navigationSessionKey = (uid: string) => `sp_navigation_v1:${uid}`;
const home = (): NavigationSession => ({ section: 'dashboard', subjectId: null, chapterId: null, videos: false });

/** Resolve IDs against the student's current curriculum; never trust stored page labels. */
export function restoreNavigationSession(raw: string | null, classLevel: string, subjects: Subject[]): NavigationSession {
  try {
    const saved = JSON.parse(raw || 'null');
    if (!saved || saved.version !== 1 || saved.classLevel !== classLevel ||
      !['dashboard', 'planner', 'homework', 'diary'].includes(saved.section)) return home();
    if (saved.section !== 'dashboard') return { ...home(), section: saved.section };
    const subject = subjects.find(subject => subject.id === saved.subjectId);
    if (!subject) return home();
    const chapter = subject.chapters.find(chapter => chapter.id === saved.chapterId);
    return { section: 'dashboard', subjectId: subject.id, chapterId: chapter?.id || null, videos: !!chapter && saved.videos === true };
  } catch { return home(); }
}

export function serializeNavigationSession(classLevel: string, navigation: NavigationSession) {
  return JSON.stringify({ version: 1, classLevel, ...navigation });
}
