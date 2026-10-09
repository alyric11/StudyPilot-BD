import type { UserProfile } from '../types';
import type { StudentStorage } from './accountStorage';
import { profileAvatarChoices } from './profileAvatars';

export type ProfileSettings = Pick<UserProfile, 'name' | 'username' | 'birthdate' | 'classLevel' | 'instructionLanguage' | 'avatarUrl'>;
export const profileClasses = (level: UserProfile['classLevel']): UserProfile['classLevel'][] =>
  level === 'Class 9' || level === 'Class 10' ? ['Class 9', 'Class 10'] : ['Class 11', 'Class 12'];
export function validateProfileSettings(current: UserProfile, draft: ProfileSettings, today: string) {
  if (!draft.name.trim() || draft.name.trim().length > 80) throw new Error('Enter a name of 1–80 characters.');
  if ((draft.username || '').trim().length > 40) throw new Error('Keep your username within 40 characters.');
  if (!profileClasses(current.classLevel).includes(draft.classLevel)) throw new Error('Choose a class within your current SSC or HSC level.');
  if (!['en', 'bn'].includes(draft.instructionLanguage || 'en')) throw new Error('Choose English or Bangla for instructions.');
  if (draft.avatarUrl !== undefined && draft.avatarUrl !== current.avatarUrl && !profileAvatarChoices.includes(draft.avatarUrl))
    throw new Error('Choose an avatar from the available choices.');
  const date = draft.birthdate || '';
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < '1900-01-01' || date > today || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date))
    throw new Error('Enter a valid birthdate that is not in the future.');
}
// Only this existing private profile record changes. Never run onboarding again.
export function saveProfileSettings(storage: StudentStorage, draft: ProfileSettings, today: string): UserProfile {
  const raw = storage.getItem('sp_profile');
  if (!raw) throw new Error('Your profile could not be read. Close settings and try again.');
  const current = JSON.parse(raw) as UserProfile;
  validateProfileSettings(current, draft, today);
  const next = { ...current, name: draft.name.trim(), classLevel: draft.classLevel,
    instructionLanguage: draft.instructionLanguage || 'en' };
  if (draft.username?.trim()) next.username = draft.username.trim(); else delete next.username;
  if (draft.birthdate) next.birthdate = draft.birthdate; else delete next.birthdate;
  if (draft.avatarUrl !== undefined) next.avatarUrl = draft.avatarUrl;
  storage.setItem('sp_profile', JSON.stringify(next));
  return next;
}
