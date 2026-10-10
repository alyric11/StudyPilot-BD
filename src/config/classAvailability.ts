import type { UserProfile } from '../types';

// Set true to reopen Classes 9–10 after the HSC student trial.
export const SSC_CLASSES_ENABLED = false;
export const CLASS_TRIAL_MESSAGE = 'This trial is available to Class 11 and Class 12 students. Classes 9 and 10 are temporarily unavailable.';
export function isClassEnabled(level: string, sscEnabled = SSC_CLASSES_ENABLED): boolean {
  return level === 'Class 11' || level === 'Class 12' ||
    (sscEnabled && (level === 'Class 9' || level === 'Class 10'));
}
export const DEFAULT_ENABLED_CLASS: UserProfile['classLevel'] = SSC_CLASSES_ENABLED ? 'Class 9' : 'Class 11';
