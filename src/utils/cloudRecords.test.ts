import test from "node:test";
import assert from "node:assert/strict";
import { applyPatch, combinePatches, diffRecords, recordsForKey, restoreRecords } from "./cloudRecords";
import { createStudentCloud, type CloudTransport } from "../cloud/studentCloud";

const raw = JSON.stringify;
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return { get length() { return data.size; }, key: i => [...data.keys()][i] ?? null,
    getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); },
    removeItem: key => { data.delete(key); }, clear: () => data.clear() };
}
function harness() {
  let receive: Parameters<CloudTransport["listen"]>[0] = () => {};
  let fail: Parameters<CloudTransport["listen"]>[1] = () => {};
  const writes: Map<string, import("./cloudRecords").RecordPatch>[] = [];
  let writer: CloudTransport["write"] = async patches => { writes.push(patches); };
  const transport: CloudTransport = { listen: (next, error) => { receive = next; fail = error; return () => {}; }, write: patches => writer(patches) };
  return { transport, writes, receive: (...args: Parameters<typeof receive>) => receive(...args), fail: (e: unknown) => fail(e), writer: (next: typeof writer) => { writer = next; } };
}
const pause = () => new Promise(resolve => setTimeout(resolve, 760));

test("all student collection forms round trip, including empty collections", () => {
  for (const [key, value] of Object.entries({
    sp_profile: { name: "Lyric", email: "student@example.com", classLevel: "HSC" },
    sp_routine: [{ id: "a", day: "Monday", time: "08:00" }],
    sp_daily_routine_tasks: [{ date: "2026-10-03", block: { id: "a" }, completed: true }],
    sp_diary: [], sp_selected_subjects: ["physics"],
    sp_saved_videos_physics_vector: ["abcdefghijk"],
    sp_saved_videos_physics_vector_details: { abcdefghijk: { title: "Lesson" } },
    sp_progress: { physics: { vector: { readTextbook: true, madeNotes: false } } },
  })) assert.deepEqual(JSON.parse(restoreRecords(recordsForKey(key, raw(value)).values())[key]), value);
});

test("editing one note writes one record; separate field edits merge", () => {
  const notes = [{ id: "a", title: "Old", content: "Original" }, { id: "b", title: "Keep", content: "Untouched" }];
  const original = raw(notes);
  const title = diffRecords("sp_diary", original, raw([{ ...notes[0], title: "New" }, notes[1]]));
  const content = diffRecords("sp_diary", original, raw([{ ...notes[0], content: "Other device" }, notes[1]]));
  assert.equal(title.size, 1); assert.equal(Object.keys([...title.values()][0].fields).length, 1);
  const records = recordsForKey("sp_diary", original);
  for (const patches of [title, content]) patches.forEach((patch, id) => records.set(id, applyPatch(records.get(id), patch)));
  assert.deepEqual(JSON.parse(restoreRecords(records.values()).sp_diary), [{ ...notes[0], title: "New", content: "Other device" }, notes[1]]);
});

test("deletions survive an empty account and batching does not resurrect removed fields", () => {
  const before = raw([{ id: "a", title: "A", content: "B" }]);
  const records = recordsForKey("sp_diary", before);
  diffRecords("sp_diary", before, "[]").forEach((patch, id) => records.set(id, applyPatch(records.get(id), patch)));
  assert.equal(restoreRecords(records.values()).sp_diary, "[]");
  const first = [...diffRecords("sp_profile", null, raw({ name: "A", group: "Science" })).values()][0];
  const second = [...diffRecords("sp_profile", raw({ name: "A", group: "Science" }), raw({ name: "B" })).values()][0];
  assert.deepEqual(JSON.parse(restoreRecords([applyPatch(undefined, combinePatches(first, second))]).sp_profile), { name: "B" });
});

test("initial all-false progress and repeated unchanged saves do not write defaults", () => {
  const progress = raw({ physics: { vector: { readTextbook: false, madeNotes: false } } });
  const patches = diffRecords("sp_progress", progress, progress);
  assert.equal(patches.size, 0);
  assert.equal([...recordsForKey("sp_progress", progress).values()].filter(row => !row.deleted).length, 0);
});

test("empty cache cannot erase browser records; migration preserves original copy", () => {
  const base = memoryStorage(); const h = harness();
  base.setItem("studypilot:user:lyric:sp_diary", raw([{ id: "a", title: "Keep" }]));
  const cloud = createStudentCloud(base, "lyric", h.transport); cloud.start();
  try {
    h.receive(new Map(), false); assert.equal(cloud.getState().phase, "connecting");
    h.receive(new Map(), true); assert.equal(cloud.getState().phase, "choose");
    cloud.choose(true); assert.equal(cloud.getState().pending, 1);
    assert.match(cloud.exportBackup(), /Keep/);
    assert.throws(() => cloud.storage.setItem("sp_diary", "not json"));
    assert.match(cloud.storage.getItem("sp_diary")!, /Keep/);
  } finally { cloud.stop(); }
});

test("existing cloud account replaces the browser view but retains a backup", () => {
  const base = memoryStorage(); const h = harness();
  base.setItem("studypilot:user:lyric:sp_diary", raw([{ id: "old", title: "Browser" }]));
  const cloud = createStudentCloud(base, "lyric", h.transport); cloud.start();
  try {
    h.receive(recordsForKey("sp_diary", raw([{ id: "new", title: "Cloud" }])), true);
    assert.equal(cloud.getState().phase, "ready"); assert.match(cloud.storage.getItem("sp_diary")!, /Cloud/);
    assert.match(cloud.exportBackup(), /Browser/); assert.equal(cloud.getState().pending, 0);
  } finally { cloud.stop(); }
});

test("failed saves survive reload and are isolated by account", async () => {
  const base = memoryStorage(); const h = harness(); h.writer(async () => { throw { code: "resource-exhausted" }; });
  const cloud = createStudentCloud(base, "lyric", h.transport); cloud.start(); h.receive(new Map(), true);
  cloud.storage.setItem("sp_profile", raw({ name: "Lyric" })); await pause();
  assert.match(cloud.getState().error, /allowance/); assert.equal(cloud.getState().pending, 1); cloud.stop();
  const second = createStudentCloud(base, "lyric", harness().transport); second.start();
  const other = createStudentCloud(base, "another", harness().transport); other.start();
  try {
    assert.equal(second.getState().phase, "ready"); assert.equal(second.getState().pending, 1);
    assert.match(second.storage.getItem("sp_profile")!, /Lyric/); assert.equal(other.storage.getItem("sp_profile"), null);
  } finally { second.stop(); other.stop(); }
});

test("changes while a save is in flight are sent as a fresh field patch", async () => {
  const base = memoryStorage(); const h = harness();
  let finish!: () => void;
  h.writer(patches => { h.writes.push(patches); return new Promise<void>(resolve => { finish = resolve; }); });
  const cloud = createStudentCloud(base, "lyric", h.transport); cloud.start();
  const initial = { name: "Lyric", group: "Science" };
  h.receive(recordsForKey("sp_profile", raw(initial)), true);
  cloud.storage.setItem("sp_profile", raw({ ...initial, name: "L" })); await pause();
  cloud.storage.setItem("sp_profile", raw({ name: "L", group: "Arts" })); finish(); await pause();
  try {
    assert.equal(h.writes.length, 2);
    const patch = [...h.writes[1].values()][0]; assert.equal(patch.reset, false);
    assert.equal(Object.keys(patch.fields).length, 1); assert.deepEqual(Object.values(patch.fields), ["Arts"]);
    finish();
  } finally { cloud.stop(); }
});

test("pending field edits overlay remote updates without removing another device's notes", () => {
  const base = memoryStorage(); const h = harness();
  const cloud = createStudentCloud(base, "lyric", h.transport); cloud.start();
  const first = [{ id: "a", title: "A", content: "Original" }];
  h.receive(recordsForKey("sp_diary", raw(first)), true);
  cloud.storage.setItem("sp_diary", raw([{ ...first[0], content: "Local pending" }]));
  h.receive(recordsForKey("sp_diary", raw([{ ...first[0], title: "Remote title" }, { id: "b", title: "New note" }])), true);
  try { assert.deepEqual(JSON.parse(cloud.storage.getItem("sp_diary")!), [{ id: "a", title: "Remote title", content: "Local pending" }, { id: "b", title: "New note" }]); }
  finally { cloud.stop(); }
});
