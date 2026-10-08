import { test } from "node:test";
import assert from "node:assert/strict";
import { iconNames, personalSubjectAppearance, personalSubjectIcon } from "./personalSubjectAppearance";

test("existing icon choices survive and library choices stay stable after renaming", () => {
  assert.equal(personalSubjectIcon("Math", "art"), "art");
  assert.ok(iconNames.includes("Music"));
  assert.equal(personalSubjectIcon("Music", "Music"), "Music");
  assert.deepEqual(personalSubjectAppearance("Music", "Music"), personalSubjectAppearance("Renamed", "Music"));
});
test("invalid saved icons fall back safely to subject defaults", () => {
  assert.equal(personalSubjectIcon("KA Math", "__proto__"), "math");
  assert.equal(personalSubjectIcon("History", "MissingIcon"), "globe");
  assert.ok(personalSubjectAppearance("CS50").tint);
});
