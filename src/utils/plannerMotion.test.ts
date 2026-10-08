import test from "node:test";
import assert from "node:assert/strict";
import { plannerColumnWidths } from "./plannerMotion";
import { getSideAwareFloatingPosition } from "./floatingPosition";

test("final planner widths account for gaps, minimum sizes and switching days", () => {
  for (const width of [760, 1000, 1440]) {
    const widths = plannerColumnWidths(width, 2);
    assert.ok(widths[2] >= 250);
    assert.ok(widths.every(value => value >= 100));
    assert.ok(Math.abs(widths.reduce((sum, value) => sum + value, 60) - Math.max(width, 910)) < 0.001);
    const switched = plannerColumnWidths(width, 5);
    assert.equal(widths[2], switched[5]);
    assert.equal(widths[5], switched[2]);
  }
  assert.deepEqual(plannerColumnWidths(760, -1), Array(7).fill(120));
});

test("chapter picker keeps its chosen side unless it no longer fits", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { innerWidth: 1440, innerHeight: 900 } });
  try {
    const header = { left: 600, right: 850, top: 240, bottom: 310 } as DOMRect;
    assert.equal(getSideAwareFloatingPosition(header, 340, 500, 12, 10, "left").placement, "left");
    const moved = { ...header, left: 50, right: 300 } as DOMRect;
    assert.equal(getSideAwareFloatingPosition(moved, 340, 500, 12, 10, "left").placement, "right");
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
