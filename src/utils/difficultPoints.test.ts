import { test } from "node:test";
import assert from "node:assert/strict";
import { readDifficultPoints, updateDifficultPoints, DIFFICULT_POINTS_KEY, type DifficultPoint } from "./difficultPoints";

test("local points survive reload, resolution, editing and deletion without touching notebook entries", () => {
  const data = new Map<string, string>([["sp_diary", "existing notebook"]]);
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let failWrites = false;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { if (failWrites) throw new Error("Quota"); data.set(key, value); },
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { dispatchEvent: () => true } });
  try {
    const point: DifficultPoint = { id: "one", subjectId: "physics", subjectName: "Physics", chapterId: "electricity",
      chapterName: "Electricity", text: "Why?", reference: "Page 7", createdAt: new Date().toISOString(), resolved: false, explanation: "" };
    updateDifficultPoints(items => [...items, point]);
    assert.deepEqual(readDifficultPoints(), [point]);
    updateDifficultPoints(items => items.map(p => ({ ...p, resolved: true, explanation: "Teacher explained" })));
    assert.equal(readDifficultPoints()[0].resolved, true);
    updateDifficultPoints(items => items.map(p => ({ ...p, resolved: false, text: "New question" })));
    assert.equal(readDifficultPoints()[0].explanation, "Teacher explained");
    failWrites = true;
    assert.throws(() => updateDifficultPoints(() => []));
    assert.equal(readDifficultPoints().length, 1);
    failWrites = false;
    updateDifficultPoints(items => items.filter(p => p.id !== "one"));
    assert.deepEqual(readDifficultPoints(), []);
    assert.equal(data.get("sp_diary"), "existing notebook");
    data.set(DIFFICULT_POINTS_KEY, "broken saved data");
    assert.throws(() => updateDifficultPoints(() => []));
    assert.equal(data.get(DIFFICULT_POINTS_KEY), "broken saved data");
    data.clear();
    assert.deepEqual(readDifficultPoints(), []);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
