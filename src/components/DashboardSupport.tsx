import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, ExternalLink, LibraryBig, Pencil, Plus } from "lucide-react";
import type { AdditionalSubject, RoutineBlock, DailyRoutineTask } from "../types";
import { getScheduledRoutineTasks, localDateKey } from "../utils/routineTasks";
import { personalSubjectIcon, personalSubjectIcons } from "../utils/personalSubjectAppearance";
import { STUDY_RESOURCES } from "../data/resources";

export function PersonalSubjectsPanel({ subjects, routineBlocks = [], dailyRoutineTasks = [], onEdit, onAdd }: {
  subjects: AdditionalSubject[];
  routineBlocks?: RoutineBlock[];
  dailyRoutineTasks?: DailyRoutineTask[];
  onEdit: (subject: AdditionalSubject) => void;
  onAdd: () => void;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const nextSessions = new Map<string, Date>();
  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(now); date.setDate(date.getDate() + offset);
    for (const task of getScheduledRoutineTasks(localDateKey(date), routineBlocks, dailyRoutineTasks, [], subjects)) {
      if (!task.subjectKey?.startsWith("additional:") || task.completed) continue;
      const start = new Date(date), [hour, minute] = task.block.startTime.split(":").map(Number);
      start.setHours(hour, minute, 0, 0);
      if (start <= now) continue;
      const id = task.subjectKey.slice("additional:".length), previous = nextSessions.get(id);
      if (!previous || start < previous) nextSessions.set(id, start);
    }
  }
  return (
    <section className="dashboard-panel dashboard-personal-panel" aria-labelledby="personal-subjects-heading">
      <header className="dashboard-support-heading">
        <span className="dashboard-support-icon dashboard-personal-tint"><BookOpen size={18} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h3 id="personal-subjects-heading" className="dashboard-support-title font-display">Personal Subjects</h3>
          <p className="dashboard-support-description">A little space for your own learning.</p>
        </div>
        <span className="dashboard-personal-count" aria-label={`${subjects.length} of 6 personal subjects`}>{subjects.length}<span> / 6</span></span>
      </header>
      <div className="dashboard-personal-list">
        {subjects.map(subject => {
          const { Icon, tint, accent, border, iconBackground } = personalSubjectIcons[personalSubjectIcon(subject.name, subject.icon)];
          const next = nextSessions.get(subject.id);
          return (
          <button key={subject.id} type="button" onClick={() => onEdit(subject)}
            style={{ "--personal-card-tint": tint, "--personal-card-accent": accent, "--personal-card-border": border, "--personal-card-icon": iconBackground } as CSSProperties}
            className="dashboard-personal-card" aria-label={`Edit ${subject.name}`}>
            <span className="dashboard-personal-identity">
              <span className="dashboard-personal-symbol"><Icon size={18} aria-hidden="true" /></span>
              <span className="dashboard-personal-name">{subject.name}</span>
            </span>
            <span className="dashboard-personal-edit" title="Edit subject"><Pencil size={13} aria-hidden="true" /></span>
            <span className="dashboard-personal-session">{next ? `Next: ${next.toLocaleDateString("en-US", { weekday: "short" })}, ${next.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Not scheduled yet"}</span>
          </button>
        ); })}
        {subjects.length === 0 && <p className="dashboard-personal-empty">Learning something outside your textbooks? Add it here.</p>}
      </div>
      <button type="button" onClick={onAdd} disabled={subjects.length >= 6} className="dashboard-personal-add">
        <Plus size={15} aria-hidden="true" /> Add Personal Subject
      </button>
    </section>
  );
}

const resourceDescriptions: Record<string, string> = {
  NCTB: "Textbooks & curriculum",
  "10 Minute School": "Lessons & exam preparation",
  Shikho: "Classes & study materials",
  "Khan Academy": "Concepts & practice",
};
const resourceOrder = ["NCTB", "10 Minute School", "Shikho", "Khan Academy"];

export function RecommendedResourcesPanel() {
  return (
    <section className="dashboard-panel dashboard-resources-panel" aria-labelledby="recommended-resources-heading">
      <header className="dashboard-support-heading">
        <span className="dashboard-support-icon dashboard-resource-tint"><LibraryBig size={18} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h3 id="recommended-resources-heading" className="dashboard-support-title font-display">Recommended Resources</h3>
          <p className="dashboard-support-description">Helpful places to continue learning.</p>
        </div>
      </header>
      <nav aria-label="Useful study websites" className="dashboard-resource-list">
        {[...STUDY_RESOURCES].sort((a, b) => resourceOrder.indexOf(a.name) - resourceOrder.indexOf(b.name)).map(resource => (
          <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer"
            aria-label={`${resource.name} (opens in a new tab)`} className="dashboard-resource-card">
            <span className="dashboard-resource-logo">
              {resource.logoUrl ? <img src={resource.logoUrl} alt="" loading="lazy" /> : <BookOpen size={19} aria-hidden="true" />}
            </span>
            <span className="dashboard-resource-copy">
              <span className="dashboard-resource-name">{resource.name}</span>
              <span className="dashboard-resource-description">{resourceDescriptions[resource.name] || resource.description}</span>
            </span>
            <ExternalLink size={14} className="dashboard-resource-arrow" aria-hidden="true" />
          </a>
        ))}
      </nav>
    </section>
  );
}

/** Balance only the supporting panels against the rendered curriculum panel. */
export default function DashboardSupport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const support = ref.current;
    const columns = support?.closest(".dashboard-columns");
    const curriculum = columns?.querySelector<HTMLElement>(".dashboard-subjects > .dashboard-panel");
    const today = columns?.querySelector<HTMLElement>(".today-tasks");
    if (!support || !curriculum || !today) return;

    const desktop = window.matchMedia("(min-width: 1280px)");
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!desktop.matches) {
          support.style.removeProperty("min-height");
          return;
        }
        const panels = Array.from(support.children) as HTMLElement[];
        const gap = parseFloat(getComputedStyle(support).rowGap) || 18;
        const naturalHeight = panels.reduce((sum, panel) => sum + panel.getBoundingClientRect().height, 0) + gap;
        const available = curriculum.getBoundingClientRect().bottom - support.getBoundingClientRect().top;
        // Never squeeze content or introduce a large empty area just for symmetry.
        support.style.minHeight = `${Math.max(naturalHeight, Math.min(available, naturalHeight + 32))}px`;
      });
    };
    const observer = new ResizeObserver(measure);
    [curriculum, today, ...Array.from(support.children)].forEach(node => observer.observe(node));
    window.addEventListener("resize", measure);
    desktop.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure);
    };
  }, []);

  return <div ref={ref} className="dashboard-support dashboard-support-balanced">{children}</div>;
}
