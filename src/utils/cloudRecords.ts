type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface CloudRecord {
  key: string;
  item: string;
  kind: "single" | "array" | "map" | "progress";
  fields: Record<string, Json>;
  order: number;
  deleted: boolean;
}
export interface RecordPatch extends Omit<CloudRecord, "fields"> {
  fields: Record<string, Json>;
  removed: string[];
  reset: boolean;
}
// Firestore treats an empty map in a merge as replacement, not a no-op.
export function cloudWriteData(patch: RecordPatch, fields: Record<string, unknown>) {
  const data = { key: patch.key, item: patch.item, kind: patch.kind, order: patch.order, deleted: patch.deleted };
  return patch.reset || Object.keys(fields).length ? { ...data, fields } : data;
}
const object = (value: unknown): value is Record<string, Json> => !!value && typeof value === "object" && !Array.isArray(value);
const safe = (name: string) => !["__proto__", "constructor", "prototype"].includes(name);
export const recordId = (record: Pick<CloudRecord, "key" | "item">) => encodeURIComponent(JSON.stringify([record.key, record.item]));

// Older browser copies may contain incomplete dated snapshots. They cannot be
// addressed as cloud documents, but must not block saving valid homework.
export function readableDatedRecords(raw: string | null): string | null {
  if (raw === null) return null;
  const rows: unknown = JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("Invalid dated routine records.");
  const valid = rows.filter(row => object(row) && typeof row.date === "string" &&
    object(row.block) && typeof row.block.id === "string");
  return valid.length === rows.length ? raw : JSON.stringify(valid);
}

function flatten(value: Json, path: string[] = [], result: Record<string, Json> = {}) {
  if (object(value) && Object.keys(value).length) {
    for (const [key, child] of Object.entries(value)) {
      if (!safe(key)) throw new Error("Unsupported record field.");
      flatten(child, [...path, key], result);
    }
  } else result[encodeURIComponent(JSON.stringify(path))] = value;
  return result;
}
function inflate(fields: Record<string, Json>): Json {
  let result: Json = {};
  for (const [encoded, value] of Object.entries(fields)) {
    const path: string[] = JSON.parse(decodeURIComponent(encoded));
    if (!Array.isArray(path) || path.some(part => typeof part !== "string" || !safe(part))) throw new Error("Invalid cloud field.");
    if (!path.length) { result = value; continue; }
    if (!object(result)) result = {};
    let cursor = result as Record<string, Json>;
    path.forEach((part, index) => {
      if (index === path.length - 1) cursor[part] = value;
      else { if (!object(cursor[part])) cursor[part] = {}; cursor = cursor[part] as Record<string, Json>; }
    });
  }
  return result;
}

export function recordsForKey(key: string, raw: string | null): Map<string, CloudRecord> {
  const result = new Map<string, CloudRecord>();
  if (raw === null) return result;
  if (!key.startsWith("sp_")) throw new Error("Only student records can be saved.");
  const value: Json = JSON.parse(raw);
  const add = (item: string, kind: CloudRecord["kind"], value: Json, order = 0) => {
    const record: CloudRecord = { key, item, kind, fields: flatten(value), order, deleted: false };
    const id = recordId(record);
    if (result.has(id)) throw new Error("Duplicate student record identity.");
    result.set(id, record);
  };
  if (key === "sp_progress" && object(value)) {
    for (const [subject, chapters] of Object.entries(value)) {
      if (!object(chapters)) throw new Error("Invalid chapter progress.");
      for (const [chapter, progress] of Object.entries(chapters)) {
        // Missing progress already means all steps are incomplete. Don't write hundreds of empty defaults.
        if (object(progress) && Object.values(progress).every(flag => flag === false)) continue;
        add(JSON.stringify([subject, chapter]), "progress", progress);
      }
    }
  } else if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      const identity = object(entry) ? typeof entry.id === "string" ? entry.id :
        typeof entry.date === "string" && object(entry.block) && typeof entry.block.id === "string" ? JSON.stringify([entry.date, entry.block.id]) : null :
        typeof entry === "string" ? entry : null;
      if (identity === null) throw new Error("A saved record has no stable identity.");
      add(identity, "array", entry, index);
    });
  } else if (key.endsWith("_details") && object(value)) {
    for (const [id, details] of Object.entries(value)) add(id, "map", details);
  } else add("value", "single", value);
  // Keep an empty collection explicit so it survives loading on a new device.
  if (!result.size) {
    const kind = key === "sp_progress" ? "progress" : key.endsWith("_details") ? "map" : "array";
    const marker: CloudRecord = { key, item: "__empty_collection", kind, fields: {}, order: 0, deleted: true };
    result.set(recordId(marker), marker);
  }
  return result;
}

export function diffRecords(key: string, before: string | null, after: string | null): Map<string, RecordPatch> {
  const previous = recordsForKey(key, key === "sp_daily_routine_tasks" ? readableDatedRecords(before) : before), next = recordsForKey(key, after);
  const patches = new Map<string, RecordPatch>();
  for (const [id, old] of previous) {
    if (!next.has(id)) patches.set(id, { ...old, deleted: true, fields: {}, removed: [], reset: false });
  }
  for (const [id, record] of next) {
    const old = previous.get(id);
    const fields = Object.fromEntries(Object.entries(record.fields).filter(([key, value]) => JSON.stringify(old?.fields[key]) !== JSON.stringify(value)));
    const removed = Object.keys(old?.fields || {}).filter(key => !(key in record.fields));
    if (!old || Object.keys(fields).length || removed.length || old.order !== record.order) {
      patches.set(id, { ...record, fields, removed, reset: !old });
    }
  }
  return patches;
}

export function applyPatch(record: CloudRecord | undefined, patch: RecordPatch): CloudRecord {
  const fields = patch.reset ? {} : { ...record?.fields };
  for (const name of patch.removed) delete fields[name];
  return { key: patch.key, item: patch.item, kind: patch.kind, order: patch.order, deleted: patch.deleted, fields: { ...fields, ...patch.fields } };
}
export function combinePatches(old: RecordPatch | undefined, next: RecordPatch): RecordPatch {
  if (!old || next.reset) return next;
  const fields = { ...old.fields, ...next.fields };
  next.removed.forEach(key => delete fields[key]);
  const removed = [...new Set([...old.removed, ...next.removed])].filter(key => !(key in fields));
  return { ...next, fields, removed, reset: old.reset };
}

export function restoreRecords(records: Iterable<CloudRecord>): Record<string, string> {
  const groups = new Map<string, CloudRecord[]>();
  for (const record of records) {
    if (!record.key.startsWith("sp_")) throw new Error("Invalid cloud record key.");
    groups.set(record.key, [...(groups.get(record.key) || []), record]);
  }
  const output: Record<string, string> = {};
  for (const [key, rows] of groups) {
    const active = rows.filter(row => !row.deleted).sort((a, b) => a.order - b.order || a.item.localeCompare(b.item));
    const kind = rows[0].kind;
    let value: Json;
    if (kind === "single") { if (!active.length) continue; value = inflate(active[0].fields); }
    else if (kind === "array") value = active.map(row => {
      // Older order-only Firestore merges erased string payloads. The stable
      // document identity still identifies the saved YouTube link exactly.
      if (key.startsWith("sp_saved_videos_") && !key.endsWith("_details") &&
        !Object.keys(row.fields).length && /^[\w-]{11}$/.test(row.item)) return row.item;
      return inflate(row.fields);
    });
    else if (kind === "map") value = Object.fromEntries(active.map(row => [row.item, inflate(row.fields)]));
    else {
      const progress: Record<string, Json> = {};
      for (const row of active) {
        const [subject, chapter] = JSON.parse(row.item);
        if (!safe(subject) || !safe(chapter)) throw new Error("Invalid progress identity.");
        if (!progress[subject]) progress[subject] = {};
        (progress[subject] as Record<string, Json>)[chapter] = inflate(row.fields);
      }
      value = progress;
    }
    output[key] = JSON.stringify(value);
  }
  return output;
}
