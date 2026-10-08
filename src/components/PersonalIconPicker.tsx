import { useState } from "react";
import { iconNames, personalSubjectIcons } from "../utils/personalSubjectAppearance";
import PersonalSubjectIcon from "./PersonalSubjectIcon";

const labelFor = (name: string) => Object.hasOwn(personalSubjectIcons, name)
  ? personalSubjectIcons[name as keyof typeof personalSubjectIcons].label
  : name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
const choices = [...Object.keys(personalSubjectIcons), ...iconNames];
export default function PersonalIconPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(48);
  const filtered = choices.filter(name => labelFor(name).toLowerCase().includes(search.trim().toLowerCase()));
  return <fieldset className="mt-4">
    <legend className="mb-2 text-[11px] font-semibold text-slate-600">Choose an icon</legend>
    <label htmlFor="personal-icon-search" className="sr-only">Search free icons</label>
    <input id="personal-icon-search" value={search} onChange={event => { setSearch(event.target.value); setLimit(48); }} placeholder="Search icons: music, science, sport…" className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
    <div className="mb-2 flex items-center gap-2 text-xs text-slate-600"><PersonalSubjectIcon name={value} size={18} />Selected: {labelFor(value)}</div>
    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-100 p-1">
      <div className="grid grid-cols-3 gap-2">
        {filtered.slice(0, limit).map(name => <button key={name} type="button" title={labelFor(name)} aria-label={labelFor(name)} aria-pressed={value === name} onClick={() => onChange(name)} className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] ${value === name ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><PersonalSubjectIcon name={name} size={18} /><span className="w-full truncate">{labelFor(name)}</span></button>)}
      </div>
      {!filtered.length && <p className="p-3 text-xs text-slate-500">No matching icons. Try another word.</p>}
      {filtered.length > limit && <button type="button" onClick={() => setLimit(limit + 48)} className="mt-2 w-full rounded-lg border border-slate-200 py-2 text-xs text-indigo-600">Show more icons</button>}
    </div>
    <p className="mt-2 text-[10px] text-slate-500">Free Lucide icon library · {iconNames.length.toLocaleString()} icons</p>
  </fieldset>;
}
