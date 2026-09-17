import assert from "node:assert/strict";
import test from "node:test";
import { dateInViewedWeek, durationDescription, firstSixRowsHeight, popupOffset, routineDuration } from "./plannerPresentation";

test("duration is explicit for same-day, overnight, and accidental long sessions", () => {
  assert.equal(routineDuration("17:00", "18:00"), 60);
  assert.equal(routineDuration("23:45", "00:15"), 30);
  assert.equal(routineDuration("17:00", "17:00"), 0);
  assert.equal(durationDescription("23:45", "00:15"), "30m · ends next day");
  assert.equal(durationDescription("17:00", "16:45"), "23h 45m · ends next day");
  assert.equal(durationDescription("17:00", "18:30"), "1h 30m");
});

test("weekday selection stays inside the Saturday-first viewed week", () => {
  const anchor = new Date(2026, 8, 17);
  const saturday = dateInViewedWeek(anchor, 6);
  const friday = dateInViewedWeek(anchor, 5);
  assert.equal(saturday.getDate(), 12);
  assert.equal(friday.getDate(), 18);
  assert.equal(anchor.getDate(), 17);
  const yearBoundary = dateInViewedWeek(new Date(2027, 0, 1), 6);
  assert.equal(yearBoundary.getFullYear(), 2026);
  assert.equal(yearBoundary.getMonth(), 11);
  assert.equal(yearBoundary.getDate(), 26);
});

test("chapter viewport measures six actual rows, including wrapped names", () => {
  assert.equal(firstSixRowsHeight([40, 60, 40, 80, 40, 60, 100], 4, 20), 360);
  assert.equal(firstSixRowsHeight([40, 60], 4, 20), 124);
  assert.equal(firstSixRowsHeight([], 4, 20), 20);
});

test("popups emerge from the side adjacent to their trigger", () => {
  assert.deepEqual(popupOffset("left"), { x: 6, y: 0 });
  assert.deepEqual(popupOffset("right"), { x: -6, y: 0 });
  assert.deepEqual(popupOffset("above"), { x: 0, y: 6 });
  assert.deepEqual(popupOffset("below"), { x: 0, y: -6 });
});
