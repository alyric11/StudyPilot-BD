# Subject upcoming sessions — local changes

Study Log retains its date navigation, task display and completion controls. Its former next-session/planner link area is replaced by Upcoming [subject name] sessions. The separate Study pace panel is removed.

Today's date label reads “Today's Session”; other dates retain their formatted dates and both navigation arrows remain. The checkbox aligns with the chapter title. The planner arrow and “Open in planner” text are removed from Study Log cards.

The pending-homework banner and “Next session” label above the time are removed. Study Log and upcoming cards prefix assigned item names with their curriculum chapter/question/lesson number.

Study Log cards use a compact three-column layout: stacked times, chapter number/name and homework, and completion/planner actions. Study Log cards use the same shared pale subject background and border colors as upcoming cards. Both use matching padding, time-column widths, 20px line heights and 4px text gaps for consistent alignment and spacing.

Card styling validation: type check passed; fake-memory previews checked cyan Physics and pink Chemistry palettes, completion toggling, and the 390px mobile layout. Today's border derives from the active subject accent rather than a fixed color.

The upcoming list starts tomorrow in the student's local calendar and shows the next six currently scheduled occurrences of that exact paper, including homework-free slots. Weekly slots recur; deleted schedules are excluded, while dated time/homework snapshots remain authoritative. Changing the Study Log date does not change this list.

Each card expands its Add HW/Edit HW form downward using the same `PlannerReveal` animation as Daily Planner. Visible Add HW/Edit HW labels are omitted to keep cards compact; the right chevron indicates expansion, and accessible labels retain the action. Chapter selection stays inline, and the homework placeholder matches the planner. Save edits only one dated record through the existing shared handler. Weekly templates, other occurrences, completion state and study progress are preserved. Failed saves retain the draft and allow retry. Cancel/Escape return focus to the card.

Validation: 78 tests passed; type check and production build passed (existing bundle-size warning remains). Fake-memory browser preview verified six ordered cards, Add/Edit prefilling, saves in both directions between the subject page and planner, unchanged upcoming dates during Study Log navigation, failed-save draft retention/retry, and 390px mobile layout without horizontal overflow. Live Firestore synchronization between devices and physical-device/reduced-motion interaction were not exercised; the existing reduced-motion styles apply to PlannerReveal.

Preview: `/tests/upcoming-preview.html` on the local Vite server. Its schedules and homework exist only in memory and reset on full reload. It is not a production entrypoint. Changes are local and reversible; no student data migration is needed.


Session hover refinement: Study Log and upcoming cards reuse the landing subject cards' gentle 1px lift, subject-colored border and soft shadow, including existing reduced-motion and touch behavior. Today's viewed session keeps that stronger border at rest; background colors stay shared with upcoming cards.

Upcoming list density: show the first three sessions initially. When more are available, Show next N reveals the remaining sessions (up to six total) with PlannerReveal; Show fewer collapses them. Hidden sessions are inert, and expanded editor drafts are retained when the list collapses.
