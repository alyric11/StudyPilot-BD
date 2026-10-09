import { Guidance } from "./InstructionLanguage";
import { useId, useRef, type CSSProperties } from "react";
import { BookPlus, Check, ChevronDown } from "lucide-react";
import useDisclosureScroll from "../hooks/useDisclosureScroll";
import { getSubjectAccentColor, getSubjectCardStyles } from "../colorPalettes";

interface SelectableGroup {
  id: string;
  name: string;
  banglaName: string;
  papers: { id: string; color: string }[];
}

export default function OptionalSubjectSelector({ groups, selectedIds, open, onToggle, onSelect }: {
  groups: SelectableGroup[];
  selectedIds: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (paperIds: string[]) => void;
}) {
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prepareScroll = useDisclosureScroll(open, panelRef, revealRef, contentRef);
  const selectedCount = groups.filter(group => group.papers.some(paper => selectedIds.includes(paper.id))).length;

  return (
    <section ref={panelRef} className="dashboard-panel optional-subject-selector">
      <button type="button" className="optional-subject-toggle" onClick={() => { prepareScroll(); onToggle(); }}
        aria-expanded={open} aria-controls={panelId}>
        <span className="optional-subject-symbol"><BookPlus size={18} aria-hidden="true" /></span>
        <span className="optional-subject-heading">
          <span className="optional-subject-title font-display">{open ? "Optional Subjects" : "Add Optional Subject"}</span>
          <span className="optional-subject-description"><Guidance>Choose the subjects you want to study.</Guidance></span>
        </span>
        {selectedCount > 0 && <span className="optional-subject-count">{selectedCount} selected</span>}
        <ChevronDown size={18} className="optional-subject-chevron" aria-hidden="true" />
      </button>

      {/* Keep content mounted so both opening and closing interpolate naturally. */}
      <div ref={revealRef} id={panelId} className="optional-subject-reveal" data-open={open}
        inert={!open} aria-hidden={!open}>
        <div className="optional-subject-clip">
          <div ref={contentRef} className="optional-subject-options">
            {groups.map(group => {
              const selected = group.papers.some(paper => selectedIds.includes(paper.id));
              const color = group.papers[0]?.color ?? "slate";
              return (
                <button key={group.id} type="button" className={`optional-subject-option ${getSubjectCardStyles(color).card}`}
                  style={{ "--optional-subject-accent": getSubjectAccentColor(color) } as CSSProperties}
                  aria-pressed={selected} onClick={() => onSelect(group.papers.map(paper => paper.id))}>
                  <span className="optional-subject-option-copy">
                    <span className="optional-subject-bangla" lang="bn">{group.banglaName}</span>
                    <span className="optional-subject-english">{group.name}</span>
                  </span>
                  <span className="optional-subject-check" aria-hidden="true"><Check size={12} strokeWidth={2.5} /></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
