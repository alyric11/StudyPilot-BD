import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ENABLED_CLASS, isClassEnabled } from '../config/classAvailability';
import { saveProfileSettings } from './profileSettings';
import type { UserProfile } from '../types';

test('trial allows HSC only, defaults to Class 11, and can restore SSC without changing data', () => {
  assert.equal(DEFAULT_ENABLED_CLASS, 'Class 11');
  for (const level of ['Class 11', 'Class 12']) assert.equal(isClassEnabled(level), true);
  for (const level of ['Class 9', 'Class 10']) {
    assert.equal(isClassEnabled(level), false);
    assert.equal(isClassEnabled(level, true), true);
  }
  assert.equal(isClassEnabled('Class 8', true), false);
});

test('disabled classes cannot save settings or switch to HSC; original profile and study records remain intact', () => {
  for (const level of ['Class 9', 'Class 10'] as const) {
    const profile: UserProfile = { name: 'Student', email: 'student@example.test', school: '', classLevel: level, group: 'Science', board: 'Dhaka', examYear: '2027' };
    const records = new Map([['sp_profile', JSON.stringify(profile)], ['sp_homework', '[{"id":"keep"}]']]);
    const original = [...records];
    const storage = { getItem: (key: string) => records.get(key) || null, setItem: () => assert.fail('must not write'), removeItem: () => assert.fail('must not delete'), clear: () => assert.fail('must not clear') };
    for (const classLevel of [level, 'Class 11'] as const)
      assert.throws(() => saveProfileSettings(storage, { name: 'Changed', classLevel }, '2026-10-10'), /temporarily unavailable/);
    assert.deepEqual([...records], original);
  }
});
