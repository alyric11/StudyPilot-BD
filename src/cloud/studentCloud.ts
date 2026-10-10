import { collection, deleteField, doc, onSnapshot, writeBatch } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { createAccountStorage, type StudentStorage } from "../utils/accountStorage";
import { readPersonalVideoIds } from "../utils/chapterVideos";
import { applyPatch, cloudWriteData, combinePatches, diffRecords, readableDatedRecords, restoreRecords, type CloudRecord, type RecordPatch } from "../utils/cloudRecords";

export type CloudState = { phase: "connecting" | "choose" | "ready" | "error"; status: string; pending: number; error: string };
export interface CloudTransport {
  listen: (receive: (records: Map<string, CloudRecord>, confirmed: boolean) => void, fail: (error: unknown) => void) => () => void;
  write: (patches: Map<string, RecordPatch>) => Promise<void>;
}
function firebaseTransport(uid: string): CloudTransport {
  const reference = collection(db, "users", uid, "records");
  const records = new Map<string, CloudRecord>();
  return {
    listen: (receive, fail) => onSnapshot(reference, { includeMetadataChanges: true }, snapshot => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "removed") records.delete(change.doc.id);
        else records.set(change.doc.id, change.doc.data() as CloudRecord);
      }
      receive(new Map(records), !snapshot.metadata.fromCache);
    }, fail),
    write: async patches => {
      // Sequential chunks stay below Firestore's write-batch limit.
      const entries = [...patches];
      for (let start = 0; start < entries.length; start += 400) {
        if (auth.currentUser?.uid !== uid || !auth.currentUser.emailVerified) throw new Error("Sign in again to finish saving.");
        const batch = writeBatch(db);
        for (const [id, patch] of entries.slice(start, start + 400)) {
          const fields: Record<string, unknown> = { ...patch.fields };
          if (!patch.reset) patch.removed.forEach(key => { fields[key] = deleteField(); });
          const data = cloudWriteData(patch, fields);
          // Reset only newly created/restored/deleted records; normal updates merge changed leaf fields.
          batch.set(doc(reference, id), data, patch.reset ? { mergeFields: ["key", "item", "kind", "order", "deleted", "fields"] } : { merge: true });
        }
        await batch.commit();
      }
    },
  };
}

export function cloudError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "permission-denied") return "Cloud access was denied. Check the published privacy rules and sign in again after verifying your email.";
  if (code === "resource-exhausted") return "The project's free daily allowance has been reached. Your pending changes remain in this browser. Retry after the quota resets.";
  return "Could not save online. Your browser copy and pending changes are kept. Check your connection and retry.";
}

export function createStudentCloud(base: Storage, uid: string, transport: CloudTransport = firebaseTransport(uid)) {
  const local = createAccountStorage(base, uid);
  const prefix = `studypilot:user:${uid}:`;
  const queueKey = prefix + "__cloud_pending";
  const readyKey = prefix + "__cloud_ready";
  let pending = new Map<string, RecordPatch>();
  let duringWrite = new Map<string, RecordPatch>();
  let remote = new Map<string, CloudRecord>();
  let state: CloudState = { phase: "connecting", status: "Connecting to cloud…", pending: 0, error: "" };
  let stopped = true, sending = false, confirmed = false;
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const stateListeners = new Set<(state: CloudState) => void>();
  const ownEntries = () => {
    const result: Record<string, string> = {};
    for (let i = 0; i < base.length; i++) {
      const name = base.key(i);
      if (name?.startsWith(prefix + "sp_")) result[name.slice(prefix.length)] = base.getItem(name)!;
    }
    return result;
  };
  const publish = (next: Partial<CloudState>) => {
    state = { ...state, ...next, pending: pending.size };
    stateListeners.forEach(listener => listener(state));
  };
  const persistQueue = () => base.setItem(queueKey, JSON.stringify([...pending]));
  const archive = () => {
    const entries = ownEntries();
    if (Object.keys(entries).length) {
      const name = prefix + "__browser_backup";
      // Never replace the pre-cloud copy with later cloud records.
      if (!base.getItem(name)) base.setItem(name, JSON.stringify(entries));
    }
  };
  const applyRemote = () => {
    const combined = new Map(remote);
    pending.forEach((patch, id) => combined.set(id, applyPatch(combined.get(id), patch)));
    const values = restoreRecords(combined.values());
    let changed = false;
    for (const key of new Set([...Object.keys(ownEntries()), ...Object.keys(values)])) {
      if ((values[key] ?? null) === local.getItem(key)) continue;
      if (values[key] === undefined) local.removeItem(key); else local.setItem(key, values[key]);
      changed = true;
    }
    if (changed) listeners.forEach(listener => listener());
  };
  const savedStatus = () => typeof navigator !== "undefined" && navigator.onLine === false
    ? pending.size ? "Offline—changes pending" : "Offline—using browser copy"
    : pending.size ? "Saving…" : confirmed ? "Saved online" : "Reconnecting—using browser copy";
  const schedule = () => {
    if (stopped || sending || state.phase !== "ready") return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), 700);
  };
  const flush = async () => {
    if (stopped || sending || !pending.size || state.phase !== "ready") return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { publish({ status: "Offline—changes pending" }); return; }
    sending = true;
    duringWrite = new Map();
    const operationGeneration = generation;
    const sent = new Map(pending);
    publish({ status: "Saving…", error: "" });
    const waiting = setTimeout(() => {
      if (!stopped && generation === operationGeneration) publish({ status: "Waiting for connection—changes pending" });
    }, 15000);
    try {
      await transport.write(sent);
      if (stopped || operationGeneration !== generation) return;
      // Keep a local remote baseline even if snapshot delivery follows the acknowledgement.
      sent.forEach((patch, id) => {
        remote.set(id, applyPatch(remote.get(id), patch));
        const followup = duringWrite.get(id);
        if (followup) pending.set(id, followup); else pending.delete(id);
      });
      persistQueue();
      publish({ status: savedStatus(), error: "" });
    } catch (error) {
      if (!stopped && operationGeneration === generation) publish({ status: "Couldn't save—changes kept", error: cloudError(error) });
    } finally {
      clearTimeout(waiting);
      if (operationGeneration === generation) {
        sending = false;
        if (!state.error && pending.size) schedule();
      }
    }
  };
  const enqueue = (key: string, value: string | null) => {
    if (stopped || state.phase !== "ready") throw new Error("Cloud saving is not ready.");
    const previous = local.getItem(key);
    if (previous === value) return;
    if (key === "sp_daily_routine_tasks" && readableDatedRecords(previous) !== previous) {
      const backupKey = prefix + "__dated_tasks_backup";
      if (!base.getItem(backupKey)) base.setItem(backupKey, previous!);
    }
    let readablePrevious = previous;
    if (key.startsWith("sp_saved_videos_") && !key.endsWith("_details") && previous !== null) {
      const parsed = readPersonalVideoIds(previous);
      if (parsed.unreadable) {
        const backupKey = prefix + "__video_backup:" + key;
        if (!base.getItem(backupKey)) base.setItem(backupKey, previous);
        readablePrevious = JSON.stringify(parsed.ids);
      }
    }
    const changes = diffRecords(key, readablePrevious, value);
    // Leave room below Firestore's 1 MiB per-document limit.
    for (const patch of changes.values()) {
      if (JSON.stringify(patch).length > 200000) throw new Error("This record is too large to save. Please shorten it.");
    }
    const oldQueue = new Map(pending);
    changes.forEach((patch, id) => pending.set(id, combinePatches(pending.get(id), patch)));
    try {
      persistQueue();
      if (value === null) local.removeItem(key); else local.setItem(key, value);
    } catch (error) { pending = oldQueue; persistQueue(); throw error; }
    if (sending) changes.forEach((patch, id) => duringWrite.set(id, combinePatches(duringWrite.get(id), patch)));
    publish({ status: savedStatus(), error: "" });
    schedule();
  };
  const storage: StudentStorage = {
    getItem: local.getItem,
    setItem: (key, value) => enqueue(key, value),
    removeItem: key => enqueue(key, null),
    clear: () => Object.keys(ownEntries()).forEach(key => enqueue(key, null)),
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  const receive = (records: Map<string, CloudRecord>, serverConfirmed: boolean) => {
    if (stopped) return;
    // Never interpret an empty memory-cache snapshot as an empty online account.
    if (!confirmed && !serverConfirmed) return;
    confirmed ||= serverConfirmed;
    remote = records;
    try {
      if (state.phase === "connecting") {
        archive();
        if (!remote.size && !pending.size && Object.keys(ownEntries()).length) {
          publish({ phase: "choose", status: "Choose how to start cloud saving" });
          return;
        }
      }
      if (state.phase === "choose") return;
      applyRemote();
      base.setItem(readyKey, "true");
      publish({ phase: "ready", status: savedStatus(), error: "" });
      schedule();
    } catch { publish({ phase: "error", status: "Couldn't load records", error: "Cloud records or browser storage could not be read safely. Your records have not been uploaded. Retry or download your browser backup." }); }
  };
  const reconnect = () => {
    unsubscribe?.();
    const listenerGeneration = generation;
    unsubscribe = transport.listen((records, serverConfirmed) => {
      if (listenerGeneration === generation) receive(records, serverConfirmed);
    }, error => {
      if (!stopped) publish({ phase: state.phase === "ready" ? "ready" : "error", status: "Cloud connection failed", error: cloudError(error) });
    });
  };
  return {
    storage,
    getState: () => state,
    watch: (listener: (state: CloudState) => void) => { stateListeners.add(listener); listener(state); return () => { stateListeners.delete(listener); }; },
    start: () => {
      stopped = false; generation++; sending = false;
      try {
        if (local.getItem('__account_deletion_pending') === 'true') {
          stopped = true;
          publish({ phase: 'error', status: 'Account deletion needs attention', error: 'Your account deletion was interrupted. Retry deletion below. Cloud saving remains paused.' });
          return;
        }
        pending = new Map(JSON.parse(base.getItem(queueKey) || "[]"));
        confirmed = false;
        const cached = base.getItem(readyKey) === "true";
        publish({ phase: cached ? "ready" : "connecting", status: cached ? savedStatus() : "Connecting to cloud…", error: "" });
        reconnect();
        if (cached) schedule();
      } catch { publish({ phase: "error", error: "Pending records could not be read. Download your browser backup before making changes." }); }
    },
    stop: () => { stopped = true; generation++; if (timer) clearTimeout(timer); unsubscribe?.(); },
    suspendForDeletion: () => {
      local.setItem('__account_deletion_pending', 'true');
      stopped = true; generation++; if (timer) clearTimeout(timer); unsubscribe?.();
      publish({ phase: 'error', status: 'Deleting your account…', error: '' });
    },
    deletionFailed: (message: string) => publish({ phase: 'error', status: 'Account deletion needs attention', error: message }),
    retry: () => { if (state.phase !== "ready") publish({ phase: "connecting" }); reconnect(); schedule(); },
    connectionChanged: () => {
      if (!stopped && state.phase === "ready") { publish({ status: savedStatus() }); schedule(); }
    },
    choose: (upload: boolean) => {
      // Another device may have created cloud records while this prompt was open.
      archive();
      const originals = ownEntries();
      if (upload && remote.size) throw new Error("Cloud records now exist. Use the cloud copy to avoid replacing them.");
      const previousQueue = pending;
      const nextQueue = new Map(pending);
      if (upload) {
        Object.entries(originals).forEach(([key, value]) => {
          diffRecords(key, null, value).forEach((patch, id) => {
            if (JSON.stringify(patch).length > 200000) throw new Error("A browser record is too large to upload. Download your backup before continuing.");
            nextQueue.set(id, patch);
          });
        });
        pending = nextQueue;
        try { persistQueue(); } catch (error) { pending = previousQueue; throw error; }
      }
      applyRemote(); base.setItem(readyKey, "true"); publish({ phase: "ready", error: "", status: savedStatus() }); schedule();
    },
    exportBackup: () => JSON.stringify({ accountId: uid, current: ownEntries(), beforeCloud: JSON.parse(base.getItem(prefix + "__browser_backup") || "null"), datedTasksBeforeRepair: base.getItem(prefix + "__dated_tasks_backup"), savedVideosBeforeRepair: Object.fromEntries(Array.from({ length: base.length }, (_, index) => base.key(index)).filter((key): key is string => !!key?.startsWith(prefix + "__video_backup:")).map(key => [key.slice(prefix.length), base.getItem(key)])), pending: [...pending] }, null, 2),
  };
}
export type StudentCloud = ReturnType<typeof createStudentCloud>;
