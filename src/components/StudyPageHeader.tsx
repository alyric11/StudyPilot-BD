import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, Atom, Beaker, BookOpen, Calculator, Dna, Laptop } from "lucide-react";

interface StudyPageHeaderProps {
  id?: string;
  subjectName: string;
  title: string;
  banglaTitle?: string;
  context: string;
  metadata?: string;
  accent?: string;
  onBack: () => void;
  backLabel: string;
  children?: ReactNode;
}

/** Shared identity only; page content and navigation remain owned by each page. */
export default function StudyPageHeader({
  id, subjectName, title, banglaTitle, context, metadata, accent,
  onBack, backLabel, children,
}: StudyPageHeaderProps) {
  const name = subjectName.toLowerCase();
  const SubjectIcon = name.includes("physics") ? Atom
    : name.includes("chemistry") ? Beaker
    : name.includes("biology") ? Dna
    : name.includes("math") ? Calculator
    : name.includes("ict") || name.includes("information") ? Laptop : BookOpen;

  return (
    <header id={id}
      className="subject-panel subject-overview-header rounded-2xl border border-[#e4eaf1] bg-white p-4 shadow-[0_2px_6px_rgb(36_50_71/3%)] sm:p-5"
      style={accent ? { "--subject-accent": accent } as CSSProperties : undefined}>
      <div className="flex min-w-0 items-start gap-3">
        <button type="button" onClick={onBack} aria-label={backLabel} title={backLabel}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--subject-accent)] motion-reduce:transition-none">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-start gap-2 text-xs font-medium leading-5 text-slate-500">
            <SubjectIcon className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "color-mix(in srgb, var(--subject-accent) 55%, #17243b)" }} aria-hidden="true" />
            <span className="min-w-0 break-words">{context}</span>
          </p>
          <h1 className={`mt-1 break-words text-xl font-bold leading-snug text-slate-800 sm:text-2xl${banglaTitle ? " font-bangla-title" : ""}`}>
            {banglaTitle || title}
          </h1>
          {banglaTitle && title && banglaTitle !== title && (
            <p className="mt-0.5 break-words text-sm leading-relaxed text-slate-500">{title}</p>
          )}
          {metadata && <p className="mt-2 break-words text-xs leading-relaxed text-slate-500">{metadata}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}
