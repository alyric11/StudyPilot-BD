import assert from "node:assert/strict";
import { test } from "node:test";
import { chapterRowNumber } from "./subjectOutline.ts";

test("lesson numbers follow the unit's own numbering; ordinary chapters remain intact", () => {
  assert.equal(chapterRowNumber("Lesson 1", 5), "1");
  assert.equal(chapterRowNumber("Lesson ১২", 35), "১২");
  assert.equal(chapterRowNumber("Chapter 7", 7), "7");
  assert.equal(chapterRowNumber("", 8), "8");
});

