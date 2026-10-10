import { useEffect, useMemo, useState } from "react";
import { signOut, type User } from "firebase/auth";
import App from "../App";
import { AccountContext, useAccount } from "../auth/AccountContext";
import { auth } from "../config/firebase";
import { createStudentCloud, type StudentCloud } from "./studentCloud";
import DeleteAccountSection from '../components/DeleteAccountSection';

function downloadBackup(cloud: StudentCloud) {
  const url = URL.createObjectURL(new Blob([cloud.exportBackup()], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url; link.download = "studypilot-personal-backup.json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CloudSaveStatus() {
  const { cloud } = useAccount();
  const [state, setState] = useState(cloud?.getState());
  useEffect(() => cloud?.watch(setState), [cloud]);
  if (!cloud || !state) return null;
  return <div className="px-3 text-xs text-slate-600">
    <span role="status" aria-live="polite">{state.status}{state.pending > 0 && ` (${state.pending} records pending)`}</span>
    <button type="button" className="ml-3 text-indigo-700 underline" onClick={() => downloadBackup(cloud)}>Download backup</button>
    {state.error && <div role="alert" className="text-red-700">{state.error} <button type="button" className="underline" onClick={cloud.retry}>Retry</button></div>}
  </div>;
}

export default function CloudSession({ user }: { user: User }) {
  const cloud = useMemo(() => createStudentCloud(localStorage, user.uid), [user.uid]);
  const [state, setState] = useState(cloud.getState());
  const [error, setError] = useState("");
  const [tabBusy, setTabBusy] = useState(false);
  useEffect(() => {
    const unwatch = cloud.watch(setState);
    let disposed = false;
    let release: (() => void) | undefined;
    let acquired = false;
    const controller = new AbortController();
    const waiting = window.setTimeout(() => {
      if (!disposed && !acquired) setTabBusy(true);
    }, 300);
    // The durable browser queue has one editor. Separate browsers/devices each
    // have their own queue and can edit concurrently through field merges.
    if (navigator.locks) {
      // Queue acquisition and cancel it on cleanup. An immediate try-lock can
      // mistake React's development remount for another browser tab.
      void navigator.locks.request(`studypilot-cloud:${user.uid}`, { signal: controller.signal }, async () => {
        if (disposed) return;
        acquired = true; window.clearTimeout(waiting);
        setTabBusy(false); cloud.start();
        await new Promise<void>(resolve => { release = resolve; });
      }).catch(() => { if (!disposed) setError("Could not protect browser saving. Close other StudyPilot tabs and reload."); });
    } else {
      window.clearTimeout(waiting);
      setError("Please use an up-to-date browser to protect your cloud saving.");
    }
    const connection = () => cloud.connectionChanged();
    window.addEventListener("online", connection); window.addEventListener("offline", connection);
    return () => { disposed = true; controller.abort(); window.clearTimeout(waiting); unwatch(); cloud.stop(); release?.(); window.removeEventListener("online", connection); window.removeEventListener("offline", connection); };
  }, [cloud]);
  if (state.phase === "ready") return <AccountContext.Provider value={{ user, storage: cloud.storage, cloud }}><App key={user.uid} /></AccountContext.Provider>;
  const choose = (upload: boolean) => {
    try { cloud.choose(upload); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not start cloud saving. Your browser records are kept."); }
  };
  return <main className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
    <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Your cloud study records</h1>
      {tabBusy ? <p className="text-sm text-slate-600">Waiting for another StudyPilot tab in this browser to close. Close other StudyPilot tabs; this page will continue automatically.</p> : state.phase === "choose" ? <>
        <p className="text-sm text-slate-600">This account has no cloud records yet. Would you like to upload the study records saved in this browser? A copy of your original browser records will be kept.</p>
        <button className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white" onClick={() => choose(true)}>Upload my browser records</button>
        <button className="w-full rounded-xl border p-3 text-indigo-700" onClick={() => choose(false)}>Start with the cloud copy</button>
      </> : <p role="status" className="text-sm text-slate-600">{state.status}</p>}
      {(error || state.error) && <p role="alert" className="text-sm text-red-700">{error || state.error}</p>}
      {state.phase === 'error' && state.error && <DeleteAccountSection user={user} cloud={cloud} />}
      <div className="flex flex-wrap gap-4 text-sm text-indigo-700">
        <button onClick={() => window.location.reload()}>Reload connection</button>
        <button onClick={() => downloadBackup(cloud)}>Download browser backup</button>
        <button onClick={() => void signOut(auth).catch(() => setError("Could not log out. Please retry."))}>Log out</button>
      </div>
    </section>
  </main>;
}
