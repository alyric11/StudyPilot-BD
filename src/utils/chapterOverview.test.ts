import { test } from "node:test";
import assert from "node:assert/strict";
import { formatOverviewForEditor, parseOverviewFromEditor, isOverviewHeading } from "./chapterOverview";

test("structured overview round-trips with Bengali and paragraph breaks", () => {
  const overview = { introduction: "প্রথম অনুচ্ছেদ।\n\nদ্বিতীয় অনুচ্ছেদ।", importantTopics: [
    { topic: "ওহমের সূত্র", description: "প্রথম বর্ণনা।\n\nদ্বিতীয় বর্ণনা।" },
  ] };
  assert.deepEqual(parseOverviewFromEditor(formatOverviewForEditor(overview)), overview);
});

test("ambiguous pasted text and incomplete topics are retained", () => {
  for (const text of [
    "Intro\nIMPORTANT TOPICS\nUnnumbered heading\nDescription without punctuation",
    "Intro\nIMPORTANT TOPICS\n1. Empty topic",
    "Intro\nIMPORTANT TOPICS\nNote before topic\n1. Topic\nDescription",
    "Intro\nIMPORTANT TOPICS\n1. Topic\nDescription\nIMPORTANT TOPICS\nExtra text",
  ]) {
    assert.deepEqual(parseOverviewFromEditor(text), { introduction: text, importantTopics: [] });
  }
});

test("explicit and Bengali numbered topic headings are accepted", () => {
  for (const heading of ["**শিরোনাম**", "## শিরোনাম", "১. শিরোনাম"]) {
    assert.deepEqual(parseOverviewFromEditor(`Intro\nIMPORTANT TOPICS\n${heading}\nDescription`), {
      introduction: "Intro", importantTopics: [{ topic: "শিরোনাম", description: "Description" }],
    });
  }
});

test("missing punctuation does not turn body text or formulas into headings", () => {
  assert.equal(isOverviewHeading("This paragraph has no final punctuation"), false);
  assert.equal(isOverviewHeading("V = IR"), false);
  assert.equal(isOverviewHeading("**Topic**"), true);
  assert.equal(isOverviewHeading("## Topic"), true);
  assert.equal(parseOverviewFromEditor("CHAPTER OVERVIEW"), null);
});
