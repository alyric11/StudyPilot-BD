import { useId, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Subject } from '../data/curriculum';
import type { AdditionalSubject, DailyRoutineTask, RoutineBlock } from '../types';
import { getSubjectAccentColor, getSubjectCardStyles } from '../colorPalettes';
import { getScheduledRoutineTasks, resolveRoutineChapter, updateDatedHomework } from '../utils/routineTasks';
import { upcomingSubjectSessions } from '../utils/subjectSessions';
import { formatTime12Hour } from '../utils/time';
import PlannerReveal from './PlannerReveal';

interface Props {
  subject: Subject;
  subjects: Subject[];
  additionalSubjects: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  records: DailyRoutineTask[];
  now: Date;
  onSave: (task: DailyRoutineTask) => boolean;
}

const sessionDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
};

export default function UpcomingSubjectSessions(props: Props) {
  const { subject, now, routineBlocks, records, subjects, additionalSubjects } = props;
  const heading = useId();
  const extraSessionsId = useId();
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const tasks = upcomingSubjectSessions(subject.id, routineBlocks, records, subjects, additionalSubjects, now);
  const renderSession = (task: DailyRoutineTask) => {
    const key = `${task.date}:${task.block.id}`;
    return <SessionCard key={key} task={task} props={props} open={openKey === key}
      onToggle={() => setOpenKey(current => current === key ? null : key)} onClose={() => setOpenKey(null)} />;
  };
  return <section className="subject-upcoming mt-5 border-t border-slate-100 pt-5" aria-labelledby={heading}>
    <h3 id={heading} className="mb-3 text-sm font-semibold text-slate-800">Upcoming {subject.name} sessions</h3>
    {tasks.length ? <>
      <div className="space-y-2.5">{tasks.slice(0, 3).map(renderSession)}</div>
      {tasks.length > 3 && <>
        <div id={extraSessionsId}>
          <PlannerReveal open={expanded}>
            <div className="space-y-2.5 pt-2.5">{tasks.slice(3).map(renderSession)}</div>
          </PlannerReveal>
        </div>
        <button type="button" className="subject-log-action mt-2 gap-1.5" aria-expanded={expanded}
          aria-controls={extraSessionsId} onClick={() => setExpanded(current => !current)}>
          {expanded ? 'Show fewer' : `Show next ${tasks.length - 3}`}
          <ChevronDown className={`profile-chevron h-3.5 w-3.5 ${expanded ? 'profile-chevron-open' : ''}`} aria-hidden="true" />
        </button>
      </>}
    </> : <p className="text-xs text-slate-500">No upcoming sessions scheduled.</p>}
  </section>;
}

function SessionCard({ task, props, open, onToggle, onClose }: {
  task: DailyRoutineTask; props: Props; open: boolean; onToggle: () => void; onClose: () => void;
}) {
  const { subject, subjects, additionalSubjects, records, routineBlocks, onSave } = props;
  const [chapterId, setChapterId] = useState('');
  const [homework, setHomework] = useState('');
  const [error, setError] = useState('');
  const editorId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const chapter = resolveRoutineChapter(task.block, subjects)?.chapter;
  const assigned = Boolean(chapter || task.block.chapterId || task.block.homeworkText?.trim());
  const styles = getSubjectCardStyles(task.paletteColor);
  const close = () => { onClose(); setError(''); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  const save = () => {
    // Resolve the latest dated record, preserving its time and completion.
    const current = getScheduledRoutineTasks(task.date, routineBlocks, records, subjects, additionalSubjects)
      .find(item => item.block.id === task.block.id && item.subjectKey === task.subjectKey);
    if (!current) { setError('This session has changed. Close the editor and try again.'); return; }
    const updated = updateDatedHomework(current, chapterId || null, homework, subjects, additionalSubjects);
    if (onSave(updated)) close();
    else setError('Could not save homework. Your draft is kept; please try again.');
  };
  return <div className={`today-task subject-upcoming-card subject-card-live overflow-hidden rounded-xl border ${styles.card}`}
    style={{ '--task-accent': getSubjectAccentColor(task.paletteColor), '--subject-hover-color': getSubjectAccentColor(task.paletteColor) } as CSSProperties}>
    <button ref={trigger} type="button" className="subject-upcoming-trigger" aria-expanded={open} aria-controls={editorId}
      aria-label={`${assigned ? 'Edit HW' : 'Add HW'}: ${subject.name}, ${sessionDate(task.date)}, ${formatTime12Hour(task.block.startTime)}`}
      onClick={() => {
        if (!open) { setChapterId(task.block.chapterId || chapter?.id || ''); setHomework(task.block.homeworkText || ''); setError(''); }
        onToggle();
      }}>
      <span className="today-task-time">
        <span>{formatTime12Hour(task.block.startTime)}</span>
        <span>{formatTime12Hour(task.block.endTime)}{task.block.endTime <= task.block.startTime && <sup title="Ends the next day">+1</sup>}</span>
      </span>
      <span className="subject-session-copy min-w-0">
        <span className="block text-xs font-medium text-slate-500">{sessionDate(task.date)}</span>
        <span className="today-task-title block">{subject.name}</span>
        {chapter && <span className="today-chapter-name">{chapter.chapterNumber}: <span lang="bn">{chapter.banglaName || chapter.name}</span></span>}
        <span className="today-chapter-name whitespace-pre-wrap">{task.block.homeworkText?.trim() || 'No homework assigned'}</span>
      </span>
      <ChevronDown className={`profile-chevron h-4 w-4 shrink-0 text-slate-500 ${open ? 'profile-chevron-open' : ''}`} aria-hidden="true" />
    </button>
    <div id={editorId}>
      <PlannerReveal open={open}>
        <form className="border-t border-slate-200/70 px-3 pb-3 pt-2.5 text-left"
          onSubmit={event => { event.preventDefault(); save(); }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
          <label className="block text-xs font-medium text-slate-600">Chapter <span className="font-normal">(optional)</span>
            <select value={chapterId} onChange={event => setChapterId(event.target.value)} className="planner-focus mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
              <option value="">Choose chapter</option>
              {subject.chapters.map(item => <option key={item.id} value={item.id}>{item.chapterNumber}: {item.banglaName || item.name}</option>)}
            </select>
          </label>
          <textarea value={homework} onChange={event => setHomework(event.target.value)} rows={2}
            placeholder="e.g. Read pages 12–15 and solve questions 1–3" aria-label="Homework for this date"
            onKeyDown={event => {
              if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
              event.preventDefault(); if (homework.trim() || chapterId || assigned) save();
            }}
            className="planner-focus mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400" />
          {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
          <div className="mt-2 flex justify-end gap-5">
            <button type="button" className="planner-focus subject-log-action" onClick={close}>Cancel</button>
            <button type="submit" disabled={!homework.trim() && !chapterId && !assigned} className="planner-focus subject-log-action disabled:opacity-40">Save</button>
          </div>
        </form>
      </PlannerReveal>
    </div>
  </div>;
}
