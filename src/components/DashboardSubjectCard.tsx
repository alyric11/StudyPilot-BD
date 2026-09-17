import type { CSSProperties } from "react";
import { BookOpen } from "lucide-react";
import type { Subject } from "../data/curriculum";
import type { ChapterProgress } from "../types";
import { getSubjectAccentColor, getSubjectCardStyles } from "../colorPalettes";
import { getStudyProgress } from "../utils/studyProgress";

export default function DashboardSubjectCard({ subject, progress, onOpen }: {
  subject: Subject;
  progress?: Record<string, ChapterProgress>;
  onOpen: () => void;
}) {
  const styles = getSubjectCardStyles(subject.color);
  const { percentage, revised, total, revisedUnits, totalUnits } = getStudyProgress(subject, progress);
  const count = totalUnits ? `${revisedUnits} / ${totalUnits} units revised` : `${revised} / ${total} chapters revised`;
  const showEnglishName = subject.banglaName.trim().toLowerCase() !== subject.name.trim().toLowerCase();
  return (
    <button type="button" onClick={onOpen}
      style={{ "--subject-hover-color": getSubjectAccentColor(subject.color) } as CSSProperties}
      className={`dashboard-subject subject-card-live rounded-xl border p-4 text-left ${styles.card}`}
      aria-label={`Open ${subject.name}. Study checklist ${percentage} percent. ${count}.`}>
      <span className="flex items-center gap-3">
        <span className={`subject-card-live-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="dashboard-subject-name" lang={showEnglishName ? "bn" : undefined}>{subject.banglaName}</span>
          {showEnglishName && <span className="dashboard-subject-secondary">{subject.name}</span>}
        </span>
      </span>
      <span className="dashboard-subject-progress">
        <span className="font-semibold text-slate-700">{percentage}%</span>
        <span>{count}</span>
      </span>
      <span aria-hidden="true" className="mt-2 block h-1 overflow-hidden rounded-full bg-slate-200/60">
        <span className={`block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${styles.progress}`} style={{ width: `${percentage}%` }} />
      </span>
    </button>
  );
}
