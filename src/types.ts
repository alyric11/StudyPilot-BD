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

// Dynamic NCTB textbook study guide content
export interface ChapterOverviewData {
  introduction: string;
  whyItMatters: string;
  realLifeApplications: string;
  examImportance: {
    priority: 'high' | 'medium' | 'low';
    reason: string;
  };
  learningObjectives: string[];
  prerequisites: string[];
  commonMistakes: string[];
  estimatedTime: {
    readingTextbook: string;
    watchingLectures: string;
    practice: string;
    revision: string;
  };
  studyStrategySteps: Array<{ step: string; description: string }>;
  recommendedResources: Array<{
    title: string;
    source: string; // e.g., "10 Minute School", "Khan Academy Bangla"
    url: string;
    type: 'video' | 'pdf' | 'simulation' | 'textbook';
    qualityRating: string; // e.g. "Highly Recommended"
  }>;
}
