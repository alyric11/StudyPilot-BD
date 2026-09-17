/**
 * STUDYPILOT BD - TypeScript Type Definitions
 *
 * Purpose:
 * This file contains all the core data structures used in StudyPilot BD.
 * Defining clear, simple types helps us build bugs-free code and lets
 * the student's web browser know exactly what each data object looks like.
 */

// User profile interface containing details about the student
export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  school: string;
  classLevel: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';
  group?: 'Science' | 'Business Studies' | 'Humanities' | 'None';
  board: string;
  examYear: string;
  avatarUrl?: string;
}

// Checklists tracking study progress for a textbook chapter
export interface ChapterProgress {
  readTextbook: boolean;
  watchedLectures: boolean;
  solvedExercises: boolean;
  solvedBoardQuestions: boolean;
  madeNotes: boolean;
  revisionCompleted: boolean;
}

// Maps chapterId to its progress checklists
export type SubjectProgressMap = Record<string, ChapterProgress>;

// Maps subjectId to SubjectProgressMap
export type StudentProgress = Record<string, SubjectProgressMap>;

// Homework assignment log structure
// Student-created subject without NCTB curriculum/chapter data
export interface AdditionalSubject {
  id: string;
  name: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  subject: string;
  chapter: string;
  task: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notes?: string;
}

// Weekly recurring routine block
export interface RoutineBlock {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  title: string;
  // Links a curriculum routine to its subject, so its theme never depends on the title text.
  subjectId?: string;
  // Links a curriculum routine to its exact chapter for previews and chapter navigation.
  chapterId?: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  color?: string;
}

// One dated study session, independent of the editable weekly routine.
export interface DailyRoutineTask {
  date: string; // Local YYYY-MM-DD (not UTC).
  block: RoutineBlock;
  subjectKey: string | null;
  subjectName: string;
  chapterBanglaName: string;
  paletteColor: string;
  completed: boolean;
}

export interface RoutineEditRequest {
  routineId: string;
  occurrenceDate: string;
  requestId: string;
}

// Searchable diary, equation or study notebook entry
export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  category: 'formula' | 'vocab' | 'notes' | 'reflection';
  subject: string;
  chapter: string;
  createdAt: string;
}

// Single item in a generated AI Daily Study Plan
export interface StudyPlanItem {
  timeInMinutes: number;
  subject: string;
  chapter: string;
  activity: string; // e.g., "Read pages 12-18 of the Chemistry textbook"
}

// Complete response structure of the Daily Study Planner
export interface StudyPlanResponse {
  totalMinutes: number;
  plan: StudyPlanItem[];
  motivationQuote: string; // Aligned with the NCTB class level and group
}

export interface ChapterOverviewData {
  introduction: string;

  importantTopics: Array<{
    topic: string;
    description: string;
  }>;
}
