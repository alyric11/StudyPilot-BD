# Planner regression checks

Run `npm test`, `npm run lint`, and `npm run build`.

For visual checks, start `npm run dev` and open
`http://localhost:3000/tests/planner-preview.html`.
This development-only page uses 42 in-memory sessions, two distinct papers and
a custom activity. It does not read or write student local storage. Reloading
resets the fixture; it is not an entry in the production build.

Check:

- Expand/collapse a day and switch days repeatedly: cards remain mounted,
  homework height and column width transition, and the header does not shift.
- Edit existing homework, change its chapter, save and cancel; a chapter change
  must retain the draft. Homework-only and custom-activity tasks also work.
- Use “Prepare next Physics task”: the correct paper and next week's date open.
  Saving must not change this week's record.
- Edit a weekly time: reject overlap, but allow saving the slot's own unchanged
  time. Previously saved dated times/homework must remain unchanged.
- Check at phone widths and around the planner's 760px container breakpoint:
  exactly one layout is visible, mobile actions use a sheet, and the page has
  no horizontal overflow.
- Use Tab, Shift+Tab and Escape in the chapter picker. Collapsed controls must
  not receive keyboard focus.
- With the OS/browser reduced-motion preference enabled, reveals and scrolling
  must not animate.

Automated utility tests additionally cover clearing homework without losing
the original Undo snapshot, excluding removed/moved slots consistently from
the planner and Today's tasks, and preventing legacy chapter titles from
leaking into a new date. Saved history remains in the study log.
