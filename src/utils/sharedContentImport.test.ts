import test from "node:test";
import assert from "node:assert/strict";
import { prepareSharedChapters } from "../../server/sharedContentImport";

test("shared import combines matching chapters and preserves Bengali and empty video lists", () => {
  const overview = { introduction: "বাংলা\nঅধ্যায়", importantTopics: [{ topic: "Topic", description: "Text" }] };
  const rows = prepareSharedChapters({ "physics:one": overview }, { "physics:one": [], "biology:two": [] });
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.find(row => row.id === "physics:one")?.record.overview, overview);
  assert.deepEqual(rows.find(row => row.id === "biology:two")?.record.videos, []);
  assert.equal(Object.hasOwn(rows[0].record, "overview"), false);
});
test("shared import rejects malformed input before any database writes", () => {
  assert.throws(() => prepareSharedChapters([], {}));
  assert.throws(() => prepareSharedChapters({ "invalid/key": {} }, {}));
  assert.throws(() => prepareSharedChapters({ "physics:one": { introduction: "", importantTopics: [] } }, {}));
  assert.throws(() => prepareSharedChapters({}, { "physics:one": [{ videoId: "bad" }] }));
});
