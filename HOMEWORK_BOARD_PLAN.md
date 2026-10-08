# Homework Board implementation plan

Status: stages 1–4 implemented following the user's implementation request. Verification and recovery notes are recorded below. Changes are local until pushed/deployed.

## Purpose

Give students one place to see unfinished work, identify what is due, and choose when to work on it. Support school/college, coaching, private tuition, and personal subjects. Keep entry short enough for instructions such as “CQ ৩–৪”, “অঙ্ক ৫–১০”, and “Finish practical notebook”.

## Agreed scope

- Combine homework entered in the Board and dated routine cards into one assignment system.
- Add and edit homework quickly, with optional dates, chapters, source, and remaining-work notes.
- Group by due date, preserve unfinished work, and collapse completed work.
- Link an assignment to existing dated study sessions and open its chapter when available.
- Use existing subject colors and established controls. Keep the current Planner layout, animation, navigation, and unrelated pages.
- Exclude AI homework generation, notifications, attachments, teacher accounts, new databases, gamification, and automatic time scheduling from this version.

## Current implementation: inspect these first

- `src/components/HomeworkManager.tsx`: Board form/list; currently separate from routine homework, requires a deadline, sorts by priority, and lacks editing.
- `src/components/StudyPlanner.tsx`: dated routine homework editor, save/clear/delete behavior, weekly template editing.
- `src/hooks/useStudentData.ts`: Board handlers and `handleSaveDatedRoutineTask`; storage keys are `sp_homework` and `sp_daily_routine_tasks`.
- `src/types.ts`: `Homework`, `DailyRoutineTask`, `RoutineBlock`.
- `src/utils/routineTasks.ts`: local dates, dated session identity, completion, and scheduled versus historical session selectors.
- `src/App.tsx`: props/navigation wiring and dashboard pending-homework count; currently that count uses today's routine sessions.
- `src/utils/cloudRecords.ts`, `src/cloud/studentCloud.ts`, and their existing tests: record identity, serialization, merge/deletion rules, pending writes and recovery.
- Existing account-storage and backup code: preserve account isolation and backup compatibility.

## Rules that must hold

1. A homework assignment has one permanent ID and one authoritative record. Both views use that record for instruction, remaining-work note, and completion.
2. A dated study session is identified by its local date plus routine block ID. Do not attach homework to a recurring weekly template.
3. A due date and a planned study date are different. Planning or moving a study session never changes the deadline.
4. Completing a study session never completes homework automatically. Completing homework never completes a session or chapter checklist automatically.
5. Deleting or moving a routine must not delete its assignment. Unfinished homework remains on the Board even when its linked routine no longer exists.
6. Clearing homework from a routine unlinks it from that occurrence. Deleting an assignment is a separate, clearly named Board action with confirmation; deleted work must not reappear from legacy data.
7. Support one assignment per dated routine card for this version, matching the current editor. One assignment can be planned in multiple sessions. An occupied slot must never be overwritten silently.
8. No guessed subject matching, due dates, completion, or automatic merging based only on similar text.

## Data approach

Extend the existing `Homework` record rather than creating a second homework collection. Preserve existing IDs and old fields. Add optional stable subject identity (curriculum/personal plus ID), chapter ID, source text, remaining-work note, and dated session links. Keep readable subject/chapter labels for deleted or unavailable subjects.

Use an empty deadline for “No date” if that fits the current serializer; apply the same convention in all consumers. Preserve legacy priority values for compatibility but remove priority from the main form and ordering. New records may use the existing neutral priority default.

Make assignment-owned session links authoritative so editing an instruction does not require copying it into every session. Add pure selectors to resolve the assignment for a dated session and produce the Board groups. Review the cloud serializer before choosing the final link representation. Prefer flat optional fields compatible with its existing per-record merge behavior.

## Stage 1 — Connect and preserve homework

Deliverable: existing homework is safely readable through one shared assignment model.

- Add normalization and migration helpers outside UI components.
- Keep all existing Board assignments with their original IDs, text, deadlines, notes, and completion.
- Import dated routine homework once using deterministic IDs derived from date and routine ID, checking existing records before adding anything.
- Read saved dated records, including historical ones whose weekly template has been removed. Do not create assignments for every future weekly occurrence.
- Import text-bearing homework. A chapter-only selection remains session context; do not invent an assignment instruction from it.
- For imported routine homework, preserve its instruction and chapter link, record its planned session, and leave the due date unset. The session date was not an explicit deadline.
- Do not infer assignment completion from session completion. Keep imported assignments pending and provide a brief one-time explanation that students should review their status.
- Preserve an account-scoped original backup before migration. Reuse existing backup/recovery mechanisms where appropriate.
- Migration must be repeatable without duplicates, safe after interruption, and unable to resurrect deleted imports. Persist canonical records successfully before marking migration complete. Retain original data until migration is recoverable.
- Do not assume multiple storage calls form an atomic transaction. Use deterministic reconciliation and existing queued-write recovery; do not destructively clear old records to make the migration appear complete.
- Check save failure before updating UI or closing an editor. Preserve the draft and show the existing error treatment on failure.

## Stage 2 — Simple Board and shared editing

Deliverable: students can add/edit/complete homework in either entry point and see consistent results.

- Required: subject and instruction. Include current curriculum and personal subjects.
- Optional under “More details”: chapter, due date, source (“School”, “Coaching”, or a teacher's name), and remaining-work note.
- Support Bengali and English text, pasted instructions, and multiline instructions. Avoid the current restrictive 200-character limit; choose a documented sensible limit consistent with cloud record limits.
- Preserve existing subject labels when a subject has been removed. Do not force reassignment merely to view or complete old work.
- Add Edit, Done/Undo done, and a secondary Delete action.
- Keep original instructions intact when recording partial progress; use the remaining-work note for “৩ হয়েছে; ৪ বাকি”.
- Board groups, in order: Still pending (overdue), Today, Upcoming, No date. Completed assignments go only in a collapsed Done section.
- Sort dated groups by due date, then use deterministic tie-breaking. Use local calendar dates; show Today/Tomorrow or a readable date, not UTC date arithmetic.
- Permit past due dates when recording forgotten work. Deadline remains optional. Do not block repeat assignments just because their text matches a completed one.
- Keep routine Add/Edit HW entry and familiar save interaction. Route its saves through the shared assignment handlers. Unlinked new routine homework gets a canonical assignment and a link to that occurrence.
- Show assignment completion separately from session completion in routine details.
- Update the landing-page pending-homework summary from the same canonical assignments. Label it “Pending homework” and count all unfinished assignments once, even if scheduled more than once.

## Stage 3 — Planning and chapter navigation

Deliverable: students can assign study time without duplicate entry.

- “Plan time” shows suitable existing dated routine slots for the same exact subject, initially covering the next seven days with a way to view later dates.
- Show date, time, and occupied status. Link only after the student selects a slot. Retain earlier session links/history when adding another study session.
- If no suitable slot exists, explain this and provide “Open Daily Planner”. Do not create or move routine blocks automatically.
- Support unlinking a planned session without deleting the assignment. A removed/moved weekly slot should not be shown as an upcoming usable slot.
- “Open chapter” appears only when a valid curriculum subject/chapter link exists. Personal subjects do not get an invented chapter link.
- Defer “Due next class” automation: the current routine represents study time and does not reliably identify school versus coaching classes. Use an explicit due date in this version.

## Stage 4 — Presentation and verification

- Use the subject's existing soft color, readable instruction, optional source, and due date. Keep cards compact and actions clearly visible on phones.
- Prefer date groups and a simple subject filter over dense columns or a complex Kanban board.
- Preserve calm disclosure movement and reduced-motion support. Inspect desktop and narrow mobile views with long Bengali text, empty states, errors, and many assignments.
- Use isolated fixture data or a test account; do not alter real student records to run tests.
- Run type checking and production build. Add meaningful tests for identity, migration, linking, completion independence, date grouping, and save recovery, then run the existing relevant suite.

## Acceptance scenarios

1. Existing Board and routine homework survive migration, refresh, and loading on another device without duplicates.
2. A routine added next week does not repeat last week's homework automatically.
3. Editing a linked assignment in either view updates the other view.
4. Completing homework leaves routine completion and chapter progress untouched, and vice versa.
5. A no-date assignment saves successfully; overdue work remains visible and editable.
6. One assignment planned twice still appears once on the Board and in the pending count.
7. Removing a routine leaves its unfinished homework available. Removing/deleting homework does not delete the weekly routine.
8. Interrupted migration or offline/pending writes do not drop drafts, duplicate records, or resurrect deletions.
9. Personal-subject homework works; deleted subjects retain readable assignment labels.
10. Accounts stay isolated; Firestore reads/writes remain tied to actual loading/changes, not polling or per-card listeners.
11. Lyric's example: coaching CQ 3–4 due Thursday, scheduled Wednesday, remaining note “CQ 4 বাকি”, completed later. The deadline never changes while planning study time.

## Working instructions for Sol Medium

Read this plan and repository instructions, then inspect the listed integration points before editing. Implement in the order above, using shared helpers and existing persistence rather than duplicating logic. Decide routine implementation details autonomously; surface a conflict only if it changes the agreed student behavior or risks existing data. Keep the scope limited to Homework Board integration.

Complete checks before claiming success. Use focused commits so changes can be reviewed or reverted. A code rollback alone does not undo migrated student data: preserve originals and document recovery. Report exactly what was completed, what was tested, and any remaining user action. Do not claim cross-device or browser testing unless actually performed.

## Implementation and verification record — 8 October 2026

- Stage 1: shared assignments, deterministic dated imports, retained unlink/deletion history, account-scoped original backup, and safe failure/retry handling. Unreadable homework is preserved and blocks overwriting. No default sample homework is added to empty accounts.
- Stage 2: curriculum/personal subjects; add/edit; optional due date, source, chapter, remaining work and preserved notes; date groups and collapsed Done; shared Planner instruction, remaining note and completion; canonical pending count. Existing priority values are retained. New instruction, source and note fields allow up to 5,000 characters each.
- Stage 3: exact-subject existing slots, seven-day pages, occupied-slot protection, explicit links/unlinks, and valid chapter navigation. Changing an assignment's subject unlinks incompatible study sessions. Unlink Undo restores the original assignment by ID, without matching similar text or overwriting newer instructions.
- Stage 4: existing subject palettes and Planner disclosure/reduced-motion CSS are reused. No Planner width/animation rules or unrelated page designs were changed.

Checks completed:

- TypeScript check and production build passed. The build retains the existing large-chunk warning.
- All 84 utility/integration tests passed, including 14 new homework cases covering migration, preservation, no duplicates, unlink/deletion history, ID-based Undo, independent completion, optional/local due dates, personal/deleted subjects, long Bengali text, failed saves, queued recovery after restart, and a second simulated cloud client.
- Isolated browser fixture at `/tests/homework-preview.html`: desktop and 390-pixel phone views, many assignments/long Bengali text, empty state, optional details, failed Board and routine saves retaining drafts, retry, Board↔Planner edits, remaining notes, completion, planning twice without inflating counts/changing deadlines, and unlink/Undo. No real student records were used.
- Existing Planner presentation/motion, routine, account-isolation and cloud-merge regression tests passed. No new cloud listeners, polling or per-card database reads were added.

Checks not performed:

- Real Firebase/Render account login, live Firestore migration/upload, and synchronization between two physical laptops. Cloud behavior was verified with isolated transports and storage, not production credentials or student records.
- Actual operating-system reduced-motion preference toggling and a physical mobile device. The existing reduced-motion CSS was inspected and preserved; browser viewport checks cover the narrow layout.

Recovery:

Before the first homework write, original `sp_homework` and `sp_daily_routine_tasks` strings are kept under the account's `__homework_backup` key. The existing Download backup export includes them as `homeworkBeforeMigration`, alongside current records and pending writes. This backup is local to the browser/account where migration first runs; download it to retain a separate copy. Original dated snapshots are not destructively cleared by migration.

A code-only rollback does not reverse saved assignment links or deletion history. Recovery should use a downloaded account-specific backup and preserve any newer student work; do not automatically replace current records with the pre-migration copy. This task did not run a data restore or modify real student records.
