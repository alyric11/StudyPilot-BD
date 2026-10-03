import test from "node:test";
import assert from "node:assert/strict";
import { canImportLegacy, createAccountStorage, importLegacy } from "./accountStorage";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    key: index => [...data.keys()][index] ?? null,
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: key => { data.delete(key); },
    clear: () => data.clear(),
  };
}

test("two accounts cannot read or clear each other's records or original browser data", () => {
  const storage = memoryStorage();
  storage.setItem("sp_profile", "original");
  storage.setItem("unrelated", "keep");
  const first = createAccountStorage(storage, "first");
  const second = createAccountStorage(storage, "second");
  first.setItem("sp_routine", "first routine");
  assert.equal(second.getItem("sp_routine"), null);
  second.setItem("sp_routine", "second routine");
  first.clear();
  assert.equal(first.getItem("sp_routine"), null);
  assert.equal(second.getItem("sp_routine"), "second routine");
  assert.equal(storage.getItem("sp_profile"), "original");
  assert.equal(storage.getItem("unrelated"), "keep");
});

test("import preserves originals and includes videos and notes only for matching email", () => {
  const storage = memoryStorage();
  storage.setItem("sp_profile", JSON.stringify({ email: "Student@example.com" }));
  storage.setItem("sp_routine", "routine");
  storage.setItem("sp_difficult_points", "notes");
  storage.setItem("sp_saved_videos", "videos");
  storage.setItem("other-app", "private");
  assert.equal(canImportLegacy(storage, " student@example.com "), true);
  assert.throws(() => importLegacy(storage, "wrong", "someone@example.com"));
  importLegacy(storage, "student", "student@example.com");
  const account = createAccountStorage(storage, "student");
  assert.equal(account.getItem("sp_routine"), "routine");
  assert.equal(account.getItem("sp_difficult_points"), "notes");
  assert.equal(account.getItem("sp_saved_videos"), "videos");
  assert.equal(account.getItem("other-app"), null);
  assert.equal(storage.getItem("sp_routine"), "routine");
  assert.throws(() => importLegacy(storage, "student", "student@example.com"));
});

test("failed import rolls back account copies without changing originals", () => {
  const storage = memoryStorage();
  storage.setItem("sp_profile", JSON.stringify({ email: "student@example.com" }));
  storage.setItem("sp_routine", "routine");
  const setItem = storage.setItem;
  storage.setItem = (key, value) => {
    if (key.endsWith(":sp_routine")) throw new Error("Storage full");
    setItem(key, value);
  };
  assert.throws(() => importLegacy(storage, "student", "student@example.com"));
  assert.equal(createAccountStorage(storage, "student").getItem("sp_profile"), null);
  assert.equal(storage.getItem("sp_routine"), "routine");
});

test("invalid profiles and anonymous account storage are rejected", () => {
  const storage = memoryStorage();
  storage.setItem("sp_profile", "broken JSON");
  assert.equal(canImportLegacy(storage, "student@example.com"), false);
  assert.throws(() => createAccountStorage(storage, ""));
});
