import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Plus, ListChecks, X, MoreHorizontal, Check, AlertTriangle } from "lucide-react";
import useDialogFocus from "../hooks/useDialogFocus";
import { readDifficultPoints, updateDifficultPoints, type DifficultPoint, type PointContext } from "../utils/difficultPoints";

const notice = "Saved in this browser only. Clearing site data or resetting the app removes these notes.";
const button = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500";
const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const accent: CSSProperties = { color: "var(--subject-accent-strong, #5145a0)", background: "var(--subject-accent-soft, #f2f0ff)" };

export default function DifficultPoints({ context, subjectContext }: {
  context?: PointContext;
  subjectContext?: { subjectId: string; subjectName: string };
}) {
  const [points, setPoints] = useState<DifficultPoint[]>([]);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"list" | "write" | "resolve" | "delete" | null>(null);
  const [selected, setSelected] = useState<DifficultPoint | null>(null);
  const [text, setText] = useState("");
  const [reference, setReference] = useState("");
  const [explanation, setExplanation] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = () => { setPanel(null); setMenu(null); };
  useDialogFocus(!!panel, dialogRef, close);
  useEffect(() => {
    const load = () => {
      try { setPoints(readDifficultPoints()); setError(""); }
      catch { setError("Saved points could not be read. Your existing data has not been changed."); }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("difficult-points-changed", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("difficult-points-changed", load);
    };
  }, []);
  useEffect(() => { close(); setChapter(""); }, [context?.subjectId, context?.chapterId, subjectContext?.subjectId]);
  const selectedSubject = subjectContext?.subjectId ?? subject;
  const scoped = points.filter(point => context
    ? point.subjectId === context.subjectId && point.chapterId === context.chapterId
    : (!selectedSubject || point.subjectId === selectedSubject) && (!chapter || point.chapterId === chapter));
  const sorted = [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const open = sorted.filter(point => !point.resolved);
  const resolved = sorted.filter(point => point.resolved);
  const subjectOpen = points.filter(point => point.subjectId === subjectContext?.subjectId && !point.resolved)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const beginWrite = (point: DifficultPoint | null) => {
    setSelected(point); setText(point?.text ?? ""); setReference(point?.reference ?? "");
    setError(""); setMenu(null); setPanel("write");
  };
  const commit = (change: (items: DifficultPoint[]) => DifficultPoint[]) => {
    try { updateDifficultPoints(change); setError(""); setPanel(context || subjectContext ? "list" : null); return true; }
    catch { setError("Could not save the change in this browser. Your text is still here. Please try again."); return false; }
  };
  const rows = (items: DifficultPoint[]) => items.map(point => (
    <article key={point.id} className="border-b border-slate-100 py-4 last:border-0">
      {!context && <p className="mb-2 text-xs text-slate-500">{point.subjectName} · {point.chapterName}</p>}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{point.text}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{point.reference && point.reference + " · "}{new Date(point.createdAt).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          <button type="button" className={button} onClick={() => {
            setSelected(point); setExplanation(point.explanation); setError("");
            if (point.resolved) commit(items => items.map(item => item.id === point.id ? { ...item, resolved: false } : item));
            else setPanel("resolve");
          }}>{point.resolved ? "Reopen" : "Mark resolved"}</button>
          <div className="relative">
            <button type="button" className={button} aria-label="Point options" aria-expanded={menu === point.id} onClick={() => setMenu(menu === point.id ? null : point.id)}><MoreHorizontal size={16} /></button>
            {menu === point.id && <div className="absolute right-0 z-10 flex rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              <button type="button" className={button} onClick={() => beginWrite(point)}>Edit</button>
              <button type="button" className={button + " text-rose-600"} onClick={() => { setSelected(point); setError(""); setMenu(null); setPanel("delete"); }}>Delete</button>
            </div>}
          </div>
        </div>
      </div>
      {point.resolved && point.explanation && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600"><span className="font-semibold">What helped: </span>{point.explanation}</p>}
    </article>
  ));
  const list = <div>
    {!context && <div className="mb-3 flex flex-wrap gap-2">
      {!subjectContext && <select aria-label="Filter difficult points by subject" className={field + " sm:w-auto"} value={subject} onChange={e => { setSubject(e.target.value); setChapter(""); }}>
        <option value="">All subjects</option>
        {[...new Map(points.map(p => [p.subjectId, p.subjectName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>}
      <select aria-label="Filter difficult points by chapter" className={field + " sm:w-auto"} value={chapter} onChange={e => setChapter(e.target.value)}>
        <option value="">All chapters</option>
        {[...new Map(points.filter(p => subjectContext ? p.subjectId === subjectContext.subjectId : !subject || p.subjectId === subject).map(p => [p.chapterId, p.chapterName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </div>}
    {!scoped.length && <p className="py-8 text-center text-sm text-slate-500">{context ? "No difficult points saved for this chapter." : "No difficult points saved here yet. Add one from a chapter overview."}</p>}
    {rows(open)}
    {!!resolved.length && <details className="mt-3">
      <summary className="cursor-pointer rounded-lg py-2 text-sm font-medium text-slate-600"><Check size={14} className="mr-2 inline" />Resolved · {resolved.length}</summary>
      {rows(resolved)}
    </details>}
    <p className="mt-4 text-xs leading-relaxed text-slate-500">{notice}</p>
  </div>;
  return <>
    {subjectContext ? subjectOpen.length > 0 && <aside className="subject-panel subject-points-panel rounded-2xl border bg-white p-4 sm:p-5" aria-label="Points to clarify">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-800">Points to clarify</h2>
        <span className="subject-accent-text text-xs font-semibold">{subjectOpen.length} open</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Your saved questions, ready to revisit.</p>
      <div className="mt-3">
        {subjectOpen.slice(0, 2).map(point => <button key={point.id} type="button" className="subject-point-preview" onClick={() => beginWrite(point)}>
          <span className="block text-xs text-slate-500">{point.chapterName}</span>
          <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-slate-700">{point.text}</span>
        </button>)}
      </div>
      <button type="button" className="subject-log-action mt-2" onClick={() => { setChapter(""); setSelected(null); setPanel("list"); }}>View all points →</button>
    </aside> : context ? <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 md:px-7">
      <button type="button" className={button} style={accent} onClick={() => beginWrite(null)}><Plus size={15} />Note a difficult point</button>
      <button type="button" className={button + " text-slate-600"} onClick={() => { setSelected(null); setPanel("list"); }}><ListChecks size={15} />My points · {open.length} open</button>
    </div> : list}
    {!panel && error && <p role="alert" className="p-3 text-sm text-rose-600">{error}</p>}
    {panel && createPortal(
      <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[1px]">
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="difficult-points-heading"
          className={"max-h-[85dvh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl " + (panel === "delete" ? "max-w-xs" : "max-w-lg")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="difficult-points-heading" className="text-base font-semibold text-slate-800">
              {panel === "list" ? "My difficult points" : panel === "delete" ? "Delete this point?" : panel === "resolve" ? "Mark resolved" : selected ? "Edit difficult point" : "Note a difficult point"}
            </h2>
            <button type="button" className={button} aria-label="Close difficult points" onClick={close}><X size={18} /></button>
          </div>
          {panel !== "delete" && (context || selected) && <p className="mb-4 text-xs text-slate-500">{(selected ?? context)?.subjectName} · {(selected ?? context)?.chapterName}</p>}
          {panel === "list" ? list : <form onSubmit={e => {
            e.preventDefault();
            if (panel === "delete" && selected) commit(items => items.filter(p => p.id !== selected.id));
            else if (panel === "resolve" && selected) commit(items => items.map(p => p.id === selected.id ? { ...p, resolved: true, explanation: explanation.trim() } : p));
            else {
              if (!text.trim()) { setError("Write what is confusing before saving."); return; }
              if (!selected && !context) return;
              const point: DifficultPoint = selected ? { ...selected, text: text.trim(), reference: reference.trim() } : {
                ...context!, id: crypto.randomUUID(), text: text.trim(), reference: reference.trim(), createdAt: new Date().toISOString(), resolved: false, explanation: "",
              };
              commit(items => selected ? items.map(p => p.id === selected.id ? point : p) : [...items, point]);
            }
          }}>
            {panel === "delete" ? <p className="text-center text-sm leading-relaxed text-slate-500"><AlertTriangle className="mx-auto mb-2 text-rose-500" size={22} />This point and its explanation will be removed from this browser.</p> : panel === "resolve" ?
              <label className="block text-sm text-slate-700">What helped you understand? (optional)<textarea className={field} rows={4} value={explanation} onChange={e => setExplanation(e.target.value)} /></label> :
              <div className="space-y-4">
                <label className="block text-sm text-slate-700">What is confusing?<textarea autoFocus required className={field} rows={5} value={text} onChange={e => setText(e.target.value)} /></label>
                <label className="block text-sm text-slate-700">Page or question number (optional)<input className={field} value={reference} onChange={e => setReference(e.target.value)} /></label>
                <p className="text-xs leading-relaxed text-slate-500">{notice}</p>
              </div>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className={button + " border border-slate-200 text-slate-600"} onClick={() => setPanel(context || subjectContext ? "list" : null)}>{panel === "delete" ? "Keep" : "Cancel"}</button>
              <button type="submit" className={button + (panel === "delete" ? " bg-rose-600 text-white hover:bg-rose-700" : " bg-indigo-600 text-white hover:bg-indigo-700")}>{panel === "delete" ? "Delete" : panel === "resolve" ? "Mark resolved" : "Save"}</button>
            </div>
          </form>}
          {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>
      </div>, document.body)}
  </>;
}
