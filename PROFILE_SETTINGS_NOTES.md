# Profile settings — local implementation

The header name and chevron open Profile settings and Log out. The avatar and class label are not buttons. Reset is excluded.

Settings edit the existing private `sp_profile` record through the existing account/cloud storage layer. Onboarding is not reused: its progress initialization would erase existing progress. Existing profile fields and all study collections are preserved. The saved profile remains the source of the displayed name; no separate Firebase Auth display-name write is needed.

Username and birthdate are optional and removable. Username is not a unique identifier or login method. Instruction language defaults to English for existing accounts. English labels remain; curated help, confirmations and common errors have Bangla guidance across the main study screens. Student content and generated lessons are never translated. Unmapped service errors retain their original text.

Class changes are restricted to 9/10 or 11/12, with a syllabus visibility notice. Progress and records are retained under their existing IDs. Password changes use Firebase reauthentication followed by updatePassword; recovery uses the account email. Passwords never enter student storage.

## Settings revision — October 9, 2026

- Avatar chooser offers 60 stable DiceBear Adventurer characters, 12 at a time, with pastel backgrounds, preview and artist/license attribution. Public seeds contain no student details. Images use the external DiceBear service and need connectivity to load. Existing avatars remain until a new choice is saved. Only `sp_profile` is written, including `avatarUrl`.
- Avatar is left of the header name with tight spacing. Only the name and chevron open the menu. The header profile section does not show class; class remains in the dashboard and settings.
- Settings offer English with a disabled “Bangla — Coming soon” option. Existing translation code and stored preferences are retained; saving settings selects English.
- Change password is always open. Current password starts empty and read-only until focused, with autofill suppression hints. Password managers may override hints. Closing unmounts and clears password drafts.
- Save feedback uses the existing cloud status, with a concise local-save fallback and online-pending message on cloud errors. Cloud success is shown only after confirmation.
- Only unsaved profile edits trigger discard/before-unload protection. Password drafts do not. Successful saves normalize draft and baseline together to avoid warnings after saving.
- Revision validation: all 75 tests, type check and production build passed; existing bundle-size warning remains. Fake-data browser preview verified avatar images, selection/save/reopen, closing after save, unsaved profile warning, empty current password/editability on focus, disabled Bangla, and desktop/390px mobile layout. Live Firebase password/recovery and two-device synchronization were not exercised. Autofill suppression was not tested with saved credentials.

## Original implementation validation

- 74 tests passed, including profile-only writes, preservation, class-pair restrictions, optional defaults, invalid/future dates, failed storage, and cloud record round-trip.
- Type check and production build passed. Existing large-bundle warning remains.
- Isolated browser preview checked desktop and 390px mobile, failed save/draft retention/retry, memory reload, name and class updates, Bangla guidance, unsaved-change confirmation, and password panel disclosure.
- No real student records or credentials were changed. Live password changes/recovery emails and two-device Firestore synchronization were not exercised. Reduced-motion styles are included; physical-device testing was not performed.

## Review and reversal

`/tests/profile-preview.html` on a running local Vite server is a fake-record preview; it resets on a full browser reload. The Reload memory copy button remounts the app with the saved in-memory profile. It is not included in the production entrypoint.

Changes are local commits, not pushed. Revert the profile feature commits in reverse order to remove the implementation. Existing student records do not require migration or rollback. Reverting code does not undo a password that a student changes through Firebase.
