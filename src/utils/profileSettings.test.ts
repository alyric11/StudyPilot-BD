import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveProfileSettings, validateProfileSettings, type ProfileSettings } from './profileSettings';
import { recordsForKey, restoreRecords } from './cloudRecords';
import type { UserProfile } from '../types';

const profile: UserProfile = { name: 'Student', email: 'student@example.test', school: 'School', classLevel: 'Class 11', group: 'Science', board: 'Dhaka', examYear: '2027', avatarUrl: 'existing-avatar' };
const draft: ProfileSettings = { name: ' New name ', username: 'student', birthdate: '2008-02-29', classLevel: 'Class 12', instructionLanguage: 'bn' };
test('settings write only the existing profile and preserve other profile fields and every study record', () => {
  const entries = new Map([['sp_profile', JSON.stringify(profile)], ['sp_progress', '{"physics":{"chapter":{"readOverview":true}}}'], ['sp_routine', '[{"id":"existing"}]'], ['sp_homework','[{"id":"hw"}]']]);
  const writes: string[] = [];
  const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { writes.push(key); entries.set(key, value); }, removeItem: () => assert.fail('must not delete'), clear: () => assert.fail('must not clear') };
  const before = new Map(entries);
  const saved = saveProfileSettings(storage, draft, '2026-10-08');
  assert.equal(saved.name, 'New name'); assert.equal(saved.classLevel, 'Class 12');
  for (const key of ['email','school','group','board','examYear','avatarUrl'] as const) assert.equal(saved[key], profile[key]);
  assert.deepEqual(writes, ['sp_profile']);
  for (const [key,value] of before) if(key !== 'sp_profile') assert.equal(entries.get(key),value);
  const restored = restoreRecords(recordsForKey('sp_profile', entries.get('sp_profile')!).values());
  assert.deepEqual(JSON.parse(restored['sp_profile']), saved);
  const cleared = saveProfileSettings(storage, {...draft, username:'', birthdate:''}, '2026-10-08');
  assert.equal(cleared.username, undefined); assert.equal(cleared.birthdate, undefined);
});
test('class transitions stay within SSC or HSC in both directions', () => {
  for (const [from,to] of [['Class 9','Class 10'],['Class 10','Class 9'],['Class 11','Class 12'],['Class 12','Class 11']] as const)
    assert.doesNotThrow(() => validateProfileSettings({...profile,classLevel:from},{...draft,classLevel:to},'2026-10-08'));
  assert.throws(() => validateProfileSettings(profile, {...draft,classLevel:'Class 10'},'2026-10-08'));
});
test('optional defaults, invalid dates, future dates and empty names are validated', () => {
  assert.doesNotThrow(() => validateProfileSettings(profile,{name:'Student',classLevel:'Class 11'},'2026-10-08'));
  for(const birthdate of ['2026-02-30','2027-01-01','2007-02-29','invalid'])
    assert.throws(() => validateProfileSettings(profile,{...draft,birthdate},'2026-10-08'));
  assert.throws(() => validateProfileSettings(profile,{...draft,name:'  '},'2026-10-08'));
});
test('storage failure propagates without changing the original profile', () => {
  const raw=JSON.stringify(profile);
  const storage={getItem:()=>raw,setItem:()=>{throw new Error('full');},removeItem:()=>{},clear:()=>{}};
  assert.throws(()=>saveProfileSettings(storage,draft,'2026-10-08'),/full/);
  assert.equal(storage.getItem(),raw);
});

