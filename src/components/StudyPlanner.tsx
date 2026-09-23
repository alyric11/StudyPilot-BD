import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

import {
  UserProfile,
  AdditionalSubject,
  DailyRoutineTask,
  RoutineBlock,
  RoutineEditRequest
} from "../types";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import TimePicker from "./TimePicker";
import PlannerReveal from "./PlannerReveal";
import DayPicker from "./DayPicker";
import SubjectPicker, { SubjectPickerOption } from "./SubjectPicker";
import usePlannerPopup from "../hooks/usePlannerPopup";
import useDialogFocus from "../hooks/useDialogFocus";
import { dateInViewedWeek, durationDescription, routineDuration } from "../utils/plannerPresentation";

import { Subject } from "../data/curriculum";
import { getSubjectRoutineStyles } from "../colorPalettes";
import {
  FloatingPlacement,
  getSideAwareFloatingPosition,
} from "../utils/floatingPosition";
import { formatCompactTimeRange, formatTimeRange } from "../utils/time";
import { formatRoutineSubjectName, formatRoutineChapterNumber as formatChapterNumber, getScheduledRoutineTasks, updateDatedHomework, localDateKey, resolveRoutineChapter, resolveRoutineSubject } from "../utils/routineTasks";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Subject[];
  additionalSubjects?: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  dailyRoutineTasks: DailyRoutineTask[];
  onSaveDatedRoutineTask: (task: DailyRoutineTask) => boolean;
  onAddRoutineBlock: (
    newBlock: Omit<RoutineBlock, "id">
  ) => void;
  onDeleteRoutineBlock: (id: string) => void;
  onRestoreRoutineBlock: (block: RoutineBlock) => void;
  onUpdateRoutineBlock: (
    id: string,
    updatedBlock: Omit<RoutineBlock, "id">
  ) => void;
  onOpenRoutineChapter: (subjectId: string, chapterId: string) => void;
  editRoutineRequest?: RoutineEditRequest | null;
  onEditRequestHandled?: () => void;
  onBackToDashboard?: () => void;
}

const DAYS = [
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" }
];

const ROUTINE_COLORS = [
  "blue",
  "purple",
  "green",
  "yellow",
  "orange",
  "pink",
  "cyan",
  "rose",
  "teal",
  "violet",
  "amber"
] as const;

const ROUTINE_COLOR_STYLES = {
  blue: {
    card: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    time: "text-blue-600",
  },
  purple: {
    card: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    time: "text-purple-600",
  },
  green: {
    card: "bg-green-50 border-green-200 hover:bg-green-100",
    time: "text-green-600",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    time: "text-yellow-600",
  },
  orange: {
    card: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    time: "text-orange-600",
  },
  pink: {
    card: "bg-pink-50 border-pink-200 hover:bg-pink-100",
    time: "text-pink-600",
  },
  cyan: {
    card: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    time: "text-cyan-600",
  },
  rose: {
    card: "bg-rose-50 border-rose-200 hover:bg-rose-100",
    time: "text-rose-600",
  },
  teal: {
    card: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    time: "text-teal-600",
  },
  violet: {
    card: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    time: "text-violet-600",
  },
  amber: {
    card: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    time: "text-amber-600",
  },
} as const;

const toDayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameCalendarDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getWeekDates = (anchorDate: Date) => {
  const anchor = toDayStart(anchorDate);
  const anchorDay = anchor.getDay();

  // Saturday is the first day of our StudyPilot BD week.
  const daysFromSaturday = (anchorDay + 1) % 7;

  const weekStart = new Date(anchor);
  weekStart.setDate(anchor.getDate() - daysFromSaturday);

  return DAYS.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      ...day,
      date,
    };
  });
};

export default function StudyPlanner({
  profile,
  subjects,
  additionalSubjects = [],
  routineBlocks,
  dailyRoutineTasks,
  onSaveDatedRoutineTask,
  onAddRoutineBlock,
  onDeleteRoutineBlock,
  onRestoreRoutineBlock,
  onUpdateRoutineBlock,
  onOpenRoutineChapter,
  editRoutineRequest,
  onEditRequestHandled,
  onBackToDashboard
}: StudyPlannerProps) {
  const shouldReduceMotion = useReducedMotion();

  // ------------------------------------------------------------
  // Weekly Routine
  // ------------------------------------------------------------

  const [routineDay, setRoutineDay] = useState(() => String(new Date().getDay()));
  const [mobileRoutineDay, setMobileRoutineDay] = useState(
    new Date().getDay()
  );
  const [expandedRoutineDay, setExpandedRoutineDay] = useState<number | null>(
    () => new Date().getDay()
  );
  const [weekMotionDirection, setWeekMotionDirection] = useState<"previous" | "next">("next");
  const [weekAnchorDate, setWeekAnchorDate] = useState(() => toDayStart(new Date()));
  const routineBoardRef = React.useRef<HTMLDivElement>(null);
  const dayTabsRef = React.useRef<HTMLDivElement>(null);
  const formHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const addedBlockRef = React.useRef<Omit<RoutineBlock, "id"> | null>(null);
  const draftNeedsScroll = React.useRef(false);
  const menuAnchorRef = React.useRef<HTMLElement | null>(null);
  useEffect(() => {
    const tabs = dayTabsRef.current;
    if (!tabs) return;
    const revealSelected = () => {
      const selected = tabs.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!selected || !tabs.clientWidth) return;
      const offset = selected.getBoundingClientRect().left - tabs.getBoundingClientRect().left;
      tabs.scrollTo({ left: tabs.scrollLeft + offset - (tabs.clientWidth - selected.offsetWidth) / 2, behavior: "instant" });
    };
    revealSelected();
    const observer = new ResizeObserver(revealSelected);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [mobileRoutineDay, weekAnchorDate]);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const formOpenRef = React.useRef(showRoutineForm);
  formOpenRef.current = showRoutineForm;
  const [routineTitle, setRoutineTitle] = useState("");
  const [weeklyEditingId, setWeeklyEditingId] = useState<string | null>(null);
  const [homeworkUndo, setHomeworkUndo] = useState<DailyRoutineTask | null>(null);
  const [routineSubjectId, setRoutineSubjectId] = useState<string | null>(null);
  const [routineChapterId, setRoutineChapterId] = useState<string | null>(null);
  const [routineStart, setRoutineStart] = useState("17:00");
  const [routineEnd, setRoutineEnd] = useState("18:00");
  const [routineError, setRoutineError] = useState<string | null>(null);
  const routineErrorRef = React.useRef<HTMLDivElement>(null);
  const [routineToDelete, setRoutineToDelete] =
    useState<RoutineBlock | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<
    "homework" | "weekly-time" | null
  >(null);
  const deleteConfirmationRef = React.useRef<HTMLDivElement>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineToFocus, setRoutineToFocus] = useState<string | null>(null);
  const [isWideRoutineBoard, setIsWideRoutineBoard] = useState(false);
  const [deletedRoutine, setDeletedRoutine] = useState<RoutineBlock | null>(null);
  const deletedRoutineTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileRoutineSheetRef = React.useRef<HTMLDivElement>(null);
  const [homeworkEditorBlockId, setHomeworkEditorBlockId] = useState<string | null>(null);
  const [homeworkDateKey, setHomeworkDateKey] = useState<string | null>(null);
  const [routineMenuDateKey, setRoutineMenuDateKey] = useState<string | null>(null);
  const [homeworkChapterId, setHomeworkChapterId] = useState<string | null>(null);
  const [homeworkDraft, setHomeworkDraft] = useState("");
  const [isHomeworkChapterPickerOpen, setIsHomeworkChapterPickerOpen] = useState(false);
  const homeworkEditorAnchorRef = React.useRef<HTMLElement | null>(null);
  const homeworkEditorRef = React.useRef<HTMLDivElement>(null);
  const [homeworkEditorPosition, setHomeworkEditorPosition] = useState({
    top: 0,
    left: 0,
    width: 340,
    maxHeight: 560,
    placement: "right" as FloatingPlacement,
  });

  useEffect(() => () => {
    if (deletedRoutineTimer.current) clearTimeout(deletedRoutineTimer.current);
  }, []);

  useEffect(() => {
    const board = routineBoardRef.current;
    if (!board) return;
    const shell = board.closest(".planner-shell");
    const updateWidth = () => setIsWideRoutineBoard((shell?.clientWidth ?? board.clientWidth) >= 760);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(shell ?? board);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!routineError) return;

    const dismissRoutineError = (event: PointerEvent) => {
      if (!routineErrorRef.current?.contains(event.target as Node)) {
        setRoutineError(null);
      }
    };

    document.addEventListener("pointerdown", dismissRoutineError);
    return () => document.removeEventListener("pointerdown", dismissRoutineError);
  }, [routineError]);

  const getDayName = (dayOfWeek: number) => {
    return (
      DAYS.find((day) => day.value === dayOfWeek)?.label ||
      "Unknown"
    );
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleRoutineDateSelect = (selectedDate: Date) => {
    const date = toDayStart(selectedDate);
    const today = toDayStart(new Date());
    const isPastDate = date.getTime() < today.getTime();

    setWeekAnchorDate(date);
    setMobileRoutineDay(date.getDay());

    // A recurring routine can be prepared for today or a future weekday.
    // A past date is only for viewing its week, so reset the form to today.
    setRoutineDay(String(isPastDate ? today.getDay() : date.getDay()));
    if (isPastDate) {
      window.requestAnimationFrame(() => {
        routineBoardRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  const getRoutineDurationMinutes = routineDuration;

  const routinesOverlap = (
    firstDay: number,
    firstStartTime: string,
    firstEndTime: string,
    secondDay: number,
    secondStartTime: string,
    secondEndTime: string
  ) => {
    const minutesPerDay = 24 * 60;
    const minutesPerWeek = 7 * minutesPerDay;
    const firstStart = firstDay * minutesPerDay + timeToMinutes(firstStartTime);
    const firstEnd = firstStart + getRoutineDurationMinutes(firstStartTime, firstEndTime);
    const secondStart = secondDay * minutesPerDay + timeToMinutes(secondStartTime);
    const secondEnd = secondStart + getRoutineDurationMinutes(secondStartTime, secondEndTime);

    return [-minutesPerWeek, 0, minutesPerWeek].some((weekShift) => {
      const shiftedSecondStart = secondStart + weekShift;
      const shiftedSecondEnd = secondEnd + weekShift;

      return firstStart < shiftedSecondEnd && firstEnd > shiftedSecondStart;
    });
  };

  const handleStartTimeChange = (startTime: string) => {
    const minutesInDay = 24 * 60;
    const endMinutes = (timeToMinutes(startTime) + 60) % minutesInDay;
    const endHours = Math.floor(endMinutes / 60);
    const endMinutePart = endMinutes % 60;

    setRoutineStart(startTime);
    setRoutineEnd(
      `${String(endHours).padStart(2, "0")}:${String(endMinutePart).padStart(2, "0")}`
    );
  };

  const getRoutineColorForSubject = (subjectColor: string) => {
    const color = subjectColor.toLowerCase();

    if (color.includes("emerald") || color.includes("green")) return "green";
    if (color.includes("blue") || color.includes("sky")) return "blue";
    if (color.includes("purple") || color.includes("violet") || color.includes("periwinkle")) return "purple";
    if (color.includes("cyan")) return "cyan";
    if (color.includes("amber") || color.includes("orange")) return "amber";
    if (color.includes("teal")) return "teal";
    if (color.includes("fuchsia") || color.includes("pink")) return "pink";
    if (color.includes("rose")) return "rose";
    if (color.includes("yellow")) return "yellow";
    if (color.includes("red")) return "rose";
    if (color.includes("indigo") || color.includes("lavender") || color.includes("mint")) return "purple";
    if (color.includes("gray") || color.includes("stone") || color.includes("slate")) return "blue";

    return null;
  };

  const getSubjectRoutineColor = (title: string) => {
    const normalizedTitle = title.trim().toLowerCase();

    const matchingSubject = subjects.find((subject) => {
      const compactName = formatRoutineSubjectName(subject.name).toLowerCase();

      return (
        normalizedTitle === compactName ||
        normalizedTitle.startsWith(`${compactName}:`)
      );
    });

    if (matchingSubject) {
      return getRoutineColorForSubject(matchingSubject.color);
    }

    const matchingAdditionalSubject = safeAdditionalSubjects.find((subject) => {
      const compactName = formatRoutineSubjectName(subject.name).toLowerCase();

      return (
        normalizedTitle === compactName ||
        normalizedTitle.startsWith(`${compactName}:`)
      );
    });

    if (matchingAdditionalSubject) {
      return "amber";
    }

    return null;
  };

  const getRoutineBlockSubject = (block: RoutineBlock) => {
    return resolveRoutineSubject(block, subjects);
  };

  const getRoutineBlockChapter = (block: RoutineBlock) => {
    return resolveRoutineChapter(block, subjects);
  };

  const getMotherRoutineTitle = (block: RoutineBlock) => {
    const subject = getRoutineBlockSubject(block);
    if (subject) return formatRoutineSubjectName(subject.name);
    return block.title.split(":")[0]?.trim() || block.title;
  };

  const getDetailedRoutineInfo = (block: RoutineBlock) => {
    const details = getRoutineBlockChapter(block);

    return {
      details,
      chapterLabel: details
        ? formatChapterNumber(details.chapter.chapterNumber)
        : null,
      homeworkText: block.homeworkText?.trim() || "",
    };
  };

  const getRoutineBlockCardStyle = (block: RoutineBlock) => {
    const matchingSubject = getRoutineBlockSubject(block);

    if (matchingSubject) {
      return getSubjectRoutineStyles(matchingSubject.color).card;
    }

    const normalizedTitle = block.title.trim().toLowerCase();

    const matchingAdditionalSubject = safeAdditionalSubjects.find((subject) => {
      const compactName = formatRoutineSubjectName(subject.name).toLowerCase();

      return (
        normalizedTitle === compactName ||
        normalizedTitle.startsWith(`${compactName}:`)
      );
    });

    if (matchingAdditionalSubject) {
      return additionalSubjectStyles.card;
    }

    return (
      ROUTINE_COLOR_STYLES[block.color as keyof typeof ROUTINE_COLOR_STYLES]?.card ??
      "bg-slate-50 border-slate-200 hover:bg-slate-100"
    );
  };

  const getRoutineBlockTimeStyle = (_block: RoutineBlock) => "text-slate-600";

  const renderRoutineActions = (block: RoutineBlock, _dateKey: string, mobile = false) => {
    const actionClass = mobile ? "planner-focus routine-sheet-action" : "planner-focus routine-card-action";
    const hasHomework = Boolean(
      getRoutineBlockChapter(block) || block.homeworkText?.trim()
    );
    return (
      <div className="routine-card-actions">
        <button type="button" onClick={startEditingRoutine} className={`${actionClass} whitespace-nowrap text-[11px]`}>
          {hasHomework ? "Edit HW" : "Add HW"}
        </button>
        <button type="button" onClick={() => setDeleteConfirmation("weekly-time")} className={`${actionClass} routine-card-delete`}>Delete</button>
      </div>
    );
  };

  const renderDatedRoutineCard = (block: RoutineBlock, date: Date, expanded = true, mobile = false) => {
    const dateKey = localDateKey(date);
    const info = getDetailedRoutineInfo(block);
    const isOpen = routineToDelete?.id === block.id && routineMenuDateKey === dateKey;
    const isEditing = editingRoutineId === block.id && homeworkDateKey === dateKey;
    const subject = getRoutineBlockSubject(block);
    const draftChapter = isEditing ? subject?.chapters.find(chapter => chapter.id === homeworkChapterId) : undefined;
    const showDraft = isEditing;
    const detailsId = `routine-details-${mobile ? "mobile" : "week"}-${dateKey}-${block.id}`;
    return (
      <div
        data-routine-card-id={block.id}
        key={block.id}
        tabIndex={-1}
        onKeyDown={event => {
          if (event.key !== "Escape") return;
          event.stopPropagation();
          if (isEditing) closeHomeworkEditor(true);
          else { closeRoutineMenu(); focusVisibleRoutineCard(block.id); }
        }}
        className={`planner-focus routine-card relative overflow-hidden rounded-lg border text-center shadow-sm ${getRoutineBlockCardStyle(block)} ${isEditing ? "routine-card-editing relative z-10 ring-2 ring-indigo-300 ring-offset-2" : ""}`}
      >
        <button
          type="button"
          disabled={isEditing}
          aria-expanded={isOpen}
          aria-haspopup={mobile ? "dialog" : undefined}
          aria-controls={!mobile ? detailsId : undefined}
          aria-label={`${getMotherRoutineTitle(block)}, ${formatTimeRange(block.startTime, block.endTime)}. ${isOpen ? "Close actions" : "Open actions"}.`}
          onClick={event => openRoutineMenu(event.currentTarget.parentElement as HTMLDivElement, block, date)}
          className="planner-focus routine-card-trigger relative flex w-full flex-col items-center justify-center px-2.5 py-2.5 text-center disabled:cursor-default"
        >
          <span className="whitespace-nowrap text-xs font-medium tabular-nums text-slate-600">
            {formatCompactTimeRange(block.startTime, block.endTime)}
            {block.endTime <= block.startTime && <sup title="Ends the next day"> +1</sup>}
          </span>
          <span className="routine-card-title mt-1 min-w-0 text-[13px] font-semibold text-slate-800">{getMotherRoutineTitle(block)}</span>
          <MoreHorizontal aria-hidden="true" className="routine-card-more absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
        </button>
        <PlannerReveal open={expanded && !showDraft}>
          <div className="planner-card-details-copy border-t border-slate-200/70 px-3 pb-2.5 pt-2 text-center">
            {info.chapterLabel && <div className="text-[13px] font-medium text-slate-800">{info.chapterLabel}</div>}
            {info.details && (
              <button type="button" lang="bn"
                onClick={() => onOpenRoutineChapter(info.details!.subject.id, info.details!.chapter.id)}
                className="planner-focus routine-card-chapter-link mt-0.5 w-full rounded-md py-0.5 text-center text-[13px] font-medium leading-snug text-indigo-700 underline decoration-indigo-200 underline-offset-2"
              >{info.details.chapter.banglaName}</button>
            )}
            <div className="mt-0.5 whitespace-pre-wrap text-xs leading-snug text-slate-600">
              {info.homeworkText || "No homework assigned"}
            </div>
          </div>
        </PlannerReveal>
        {!mobile && (
          <div id={detailsId} data-routine-details>
            <PlannerReveal open={isOpen}>
              <div className="routine-card-details-inner border-t border-slate-200/70">
                {renderRoutineActions(block, dateKey)}
              </div>
            </PlannerReveal>
          </div>
        )}
        <PlannerReveal open={showDraft}>
          <div className="border-t border-slate-200/70 px-3 pb-3 pt-2.5 text-left">
            {draftChapter && (
              <div className="text-center text-xs font-medium leading-snug text-slate-700">
                {formatChapterNumber(draftChapter.chapterNumber)}: <span lang="bn">{draftChapter.banglaName}</span>
              </div>
            )}
            {!!subject?.chapters.length && (
              <button type="button" onClick={event => {
                homeworkEditorAnchorRef.current = event.currentTarget.closest("[data-routine-card-id]") as HTMLElement;
                setIsHomeworkChapterPickerOpen(true);
              }} className="planner-focus planner-text-action block w-full">{draftChapter ? "Change chapter" : "Choose chapter"}</button>
            )}
            <textarea data-homework-input-for={block.id} value={isEditing ? homeworkDraft : ""}
              onChange={event => setHomeworkDraft(event.target.value)} rows={2}
              placeholder="e.g. Read pages 12–15 and solve questions 1–3"
              aria-label="Homework for this date"
              className="planner-focus mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
            />
            <div
              className={`mt-2 flex items-center ${expanded ? "justify-center gap-6" : "justify-between gap-1"
                }`}
            >
              <button
                type="button"
                onClick={() => closeHomeworkEditor(true)}
                aria-label="Cancel homework editing"
                title="Back"
                className="planner-focus flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={saveRoutineHomework}
                disabled={!homeworkDraft.trim() && !homeworkChapterId}
                className="planner-focus routine-card-action min-h-7 whitespace-nowrap px-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmation("homework")}
                className="planner-focus routine-card-action routine-card-delete min-h-7 whitespace-nowrap px-1 text-[11px]"
              >
                Delete
              </button>
            </div>
          </div>
        </PlannerReveal>
      </div>
    );
  };

  const openRoutineFormForDate = (date: Date, shouldScroll = false) => {
    claimRoutinePopup();
    setRoutineError(null);
    closeHomeworkEditor();
    setWeeklyEditingId(null);
    setRoutineTitle("");
    setRoutineSubjectId(null);
    setRoutineChapterId(null);

    const selectedDate = toDayStart(date);
    setRoutineDay(String(selectedDate.getDay()));
    setWeekAnchorDate(selectedDate);
    setMobileRoutineDay(selectedDate.getDay());
    setExpandedRoutineDay(selectedDate.getDay());
    draftNeedsScroll.current = shouldScroll;
    setShowRoutineForm(true);
  };

  const toggleRoutineForm = () => {
    if (showRoutineForm) {
      setRoutineError(null);
      setShowRoutineForm(false);
      return;
    }

    openRoutineFormForDate(new Date());
  };

  const handleAddRoutine = () => {
    setRoutineError(null);

    const title = routineTitle.trim();

    if (!title) {
      setRoutineError("Choose a subject first.");
      return;
    }

    if (!routineStart || !routineEnd) {
      setRoutineError(
        "Choose at least 30 minutes."
      );
      return;
    }

    const routineDuration = getRoutineDurationMinutes(
      routineStart,
      routineEnd
    );

    if (routineDuration < 30) {
      setRoutineError("Choose at least 30 minutes.");
      return;
    }

    const dayOfWeek = Number(routineDay);

    const normalizedTitle = title.toLowerCase();

    const existingBlock = routineBlocks.find(
      (block) => block.title.trim().toLowerCase() === normalizedTitle
    );

    const usedColors = new Set(
      routineBlocks
        .map((block) => block.color)
        .filter(Boolean)
    );

    const availableColors = ROUTINE_COLORS.filter(
      (color) => !usedColors.has(color)
    );

    const subjectColor = getSubjectRoutineColor(title);

    const color =
      existingBlock?.color ??
      subjectColor ??
      availableColors[Math.floor(Math.random() * availableColors.length)] ??
      ROUTINE_COLORS[Math.floor(Math.random() * ROUTINE_COLORS.length)];
    const hasOverlap = routineBlocks.some((block) => {
      if (block.id === weeklyEditingId) return false;
      return routinesOverlap(
        dayOfWeek,
        routineStart,
        routineEnd,
        block.dayOfWeek,
        block.startTime,
        block.endTime
      );
    });

    if (hasOverlap) {
      setRoutineError(
        "This overlaps an existing routine. Choose another time."
      );
      return;
    }

    const updatedRoutine = {
      dayOfWeek,
      title,
      subjectId: routineSubjectId ?? undefined,
      chapterId: routineChapterId ?? undefined,
      startTime: routineStart,
      endTime: routineEnd,
      color,
    };

    addedBlockRef.current = weeklyEditingId ? null : updatedRoutine;
    setMobileRoutineDay(dayOfWeek);
    setWeekAnchorDate(dateInViewedWeek(weekAnchorDate, dayOfWeek));
    setExpandedRoutineDay(dayOfWeek);
    if (weeklyEditingId) {
      onUpdateRoutineBlock(weeklyEditingId, updatedRoutine);
      setRoutineToFocus(weeklyEditingId);
    } else {
      onAddRoutineBlock(updatedRoutine);
    }
    setWeeklyEditingId(null);

    setRoutineTitle("");
    setRoutineSubjectId(null);
    setRoutineChapterId(null);
    setShowRoutineForm(false);
  };

  const focusVisibleRoutineCard = (routineId: string) => {
    const routineCard = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-routine-card-id="${routineId}"]`
      )
    ).find((card) => card.offsetParent !== null);

    routineCard?.querySelector<HTMLButtonElement>(".routine-card-trigger")?.focus({ preventScroll: true });
  };

  const closeRoutineMenu = (afterClose?: () => void) => {
    if (!routineToDelete) return;
    setRoutineToDelete(null);
    afterClose?.();
    setRoutineMenuDateKey(null);
  };

  const openRoutineMenu = (
    cardElement: HTMLDivElement,
    block: RoutineBlock,
    occurrenceDate: Date
  ) => {
    if (editingRoutineId === block.id) return;
    if (routineToDelete?.id === block.id) {
      setRoutineToDelete(null);
      return;
    }
    claimRoutinePopup();
    menuAnchorRef.current = cardElement;
    setRoutineMenuDateKey(localDateKey(occurrenceDate));
    setRoutineToDelete(block);
  };

  useEffect(() => {
    if (!routineToDelete || !isWideRoutineBoard) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest("[data-routine-details]") &&
        !target.closest("[data-routine-card-id]")
      ) {
        closeRoutineMenu();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isWideRoutineBoard, routineToDelete]);

  const focusVisibleHomeworkInput = (blockId: string) => {
    window.requestAnimationFrame(() => {
      const inputs = Array.from(
        document.querySelectorAll<HTMLTextAreaElement>("[data-homework-input-for]")
      );
      const input = inputs.find(
        (item) =>
          item.dataset.homeworkInputFor === blockId &&
          item.getClientRects().length > 0
      );

      input?.focus({ preventScroll: true });
    });
  };

  const closeHomeworkEditor = (restoreFocus = false) => {
    if (editRoutineRequest) onEditRequestHandled?.();
    const blockId = homeworkEditorBlockId;
    const anchor = homeworkEditorAnchorRef.current;
    setIsHomeworkChapterPickerOpen(false);
    setHomeworkEditorBlockId(null);
    setHomeworkDateKey(null);
    setHomeworkChapterId(null);
    setHomeworkDraft("");
    setEditingRoutineId(null);
    homeworkEditorAnchorRef.current = null;

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        if (blockId) {
          focusVisibleRoutineCard(blockId);
        } else {
          anchor?.focus({ preventScroll: true });
        }
      });
    }
  };

  const openHomeworkEditor = (
    block: RoutineBlock,
    anchor: HTMLElement | null,
    occurrenceDateKey: string
  ) => {
    const existingTask = dailyRoutineTasks.find(
      (task) =>
        task.date === occurrenceDateKey &&
        task.block.id === block.id
    );
    const existingBlock = existingTask?.block;

    setShowRoutineForm(false);
    setRoutineError(null);
    setEditingRoutineId(block.id);
    setHomeworkEditorBlockId(block.id);
    setHomeworkDateKey(occurrenceDateKey);
    const chapterId = existingBlock ? getRoutineBlockChapter(existingBlock)?.chapter.id : undefined;
    setHomeworkChapterId(chapterId ?? null);
    setHomeworkDraft(existingBlock?.homeworkText?.trim() || "");
    setIsHomeworkChapterPickerOpen(!!getRoutineBlockSubject(block)?.chapters.length && !chapterId && !existingBlock?.homeworkText);

    homeworkEditorAnchorRef.current = anchor;

    if (anchor) {
      setHomeworkEditorPosition(
        getSideAwareFloatingPosition(
          anchor.getBoundingClientRect(),
          340,
          500
        )
      );
    }
  };

  const startEditingRoutine = () => {
    if (!routineToDelete) return;

    const block = routineToDelete;
    const anchor = menuAnchorRef.current;
    const occurrenceDateKey = routineMenuDateKey;
    closeRoutineMenu(() => {
      if (!occurrenceDateKey) return;
      openHomeworkEditor(block, anchor, occurrenceDateKey);
    });
  };

  const selectHomeworkChapter = (block: RoutineBlock, chapterId: string) => {
    setHomeworkChapterId(chapterId);
    setIsHomeworkChapterPickerOpen(false);

    focusVisibleHomeworkInput(block.id);
  };

  const saveRoutineHomework = () => {
    if (!homeworkEditorBlockId || !homeworkDateKey) return;
    const template = routineBlocks.find(item => item.id === homeworkEditorBlockId);
    if (!template) return;
    const existing = getScheduledRoutineTasks(homeworkDateKey, routineBlocks, dailyRoutineTasks, subjects, additionalSubjects)
      .find(task => task.block.id === template.id);
    if (!existing) return;
    const updated = updateDatedHomework(existing, homeworkChapterId, homeworkDraft, subjects, additionalSubjects);
    if (onSaveDatedRoutineTask(updated)) {
      setHomeworkUndo(null);
      closeHomeworkEditor(true);
    }
  };

  const deleteRoutineHomework = () => {
    if (!homeworkEditorBlockId || !homeworkDateKey) return;
    const existing = dailyRoutineTasks.find(
      (task) =>
        task.date === homeworkDateKey &&
        task.block.id === homeworkEditorBlockId
    );

    // For a new, unsaved draft, deleting simply returns the card to its
    // homework-free state. A saved task keeps its completion record while
    // removing the chapter and homework for this date.
    if (!existing) {
      closeHomeworkEditor(true);
      return;
    }

    const clearedTask = updateDatedHomework(
      existing,
      null,
      "",
      subjects,
      additionalSubjects
    );

    if (onSaveDatedRoutineTask(clearedTask)) {
      setHomeworkUndo(null);
      closeHomeworkEditor(true);
    }
  };

  const clearDatedHomework = () => {
    const existing = dailyRoutineTasks.find(task => task.date === routineMenuDateKey && task.block.id === routineToDelete?.id);
    if (!existing) return;
    if (!onSaveDatedRoutineTask(updateDatedHomework(existing, null, "", subjects, additionalSubjects))) return;
    setHomeworkUndo(existing);
    setDeletedRoutine(null);
    closeRoutineMenu();
    focusVisibleRoutineCard(existing.block.id);
  };

  const startEditingWeeklyTime = () => {
    const block = routineBlocks.find(item => item.id === routineToDelete?.id);
    if (!block) return;
    closeRoutineMenu();
    closeHomeworkEditor();
    setWeeklyEditingId(block.id);
    setRoutineTitle(getMotherRoutineTitle(block));
    setRoutineSubjectId(block.subjectId ?? getRoutineBlockSubject(block)?.id ?? null);
    setRoutineChapterId(null);
    setRoutineDay(String(block.dayOfWeek));
    setRoutineStart(block.startTime);
    setRoutineEnd(block.endTime);
    setRoutineError(null);
    draftNeedsScroll.current = true;
    setShowRoutineForm(true);
  };

  useEffect(() => {
    if (
      !homeworkEditorBlockId ||
      isHomeworkChapterPickerOpen
    ) {
      return;
    }

    focusVisibleHomeworkInput(homeworkEditorBlockId);
  }, [homeworkEditorBlockId, homeworkChapterId, isHomeworkChapterPickerOpen]);

  React.useLayoutEffect(() => {
    if (
      !homeworkEditorBlockId ||
      !isHomeworkChapterPickerOpen ||
      !homeworkEditorAnchorRef.current
    ) {
      return;
    }

    const updatePosition = () => {
      const anchor = homeworkEditorAnchorRef.current;
      if (!anchor) return;
      setHomeworkEditorPosition(
        getSideAwareFloatingPosition(
          anchor.getBoundingClientRect(),
          340,
          500
        )
      );
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        homeworkEditorRef.current?.contains(target) ||
        homeworkEditorAnchorRef.current?.contains(target)
      ) {
        return;
      }
      closeHomeworkEditor();
    };

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(homeworkEditorAnchorRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [homeworkEditorBlockId, isHomeworkChapterPickerOpen]);

  useDialogFocus(!!homeworkEditorBlockId && isHomeworkChapterPickerOpen, homeworkEditorRef, () => closeHomeworkEditor(true));
  useDialogFocus(!!deleteConfirmation, deleteConfirmationRef, () => setDeleteConfirmation(null));

  const deleteRoutineWithUndo = () => {
    if (!routineToDelete) return;
    const block = routineToDelete;
    setHomeworkUndo(null);
    closeRoutineMenu(() => {
      onDeleteRoutineBlock(block.id);
      setDeletedRoutine(block);
      if (deletedRoutineTimer.current) clearTimeout(deletedRoutineTimer.current);
      deletedRoutineTimer.current = setTimeout(() => {
        setDeletedRoutine(null);
        deletedRoutineTimer.current = null;
      }, 6000);
    });
  };

  const undoRoutineDelete = () => {
    if (!deletedRoutine) return;
    if (deletedRoutineTimer.current) clearTimeout(deletedRoutineTimer.current);
    const block = deletedRoutine;
    deletedRoutineTimer.current = null;
    setDeletedRoutine(null);
    onRestoreRoutineBlock(block);
    setRoutineToFocus(block.id);
  };

  useDialogFocus(
    !!routineToDelete && !isWideRoutineBoard,
    mobileRoutineSheetRef,
    () => closeRoutineMenu()
  );

  useEffect(() => {
    if (!editRoutineRequest) return;
    const block = routineBlocks.find(item => item.id === editRoutineRequest.routineId);
    if (!block) { onEditRequestHandled?.(); return; }
    const [year, month, day] = editRoutineRequest.occurrenceDate.split("-").map(Number);
    setWeekAnchorDate(new Date(year, month - 1, day));
    setShowRoutineForm(false);
    setRoutineToDelete(null);
    setMobileRoutineDay(block.dayOfWeek);
    setExpandedRoutineDay(block.dayOfWeek);
    // Wait for real layout/scroll stability, not an arbitrary timeout.
    let frame = 0;
    let lastPosition = "";
    let stableFrames = 0;
    let revealed = false;
    const reveal = () => {
      const card = Array.from(document.querySelectorAll<HTMLElement>("[data-routine-card-id]"))
        .find(element => element.dataset.routineCardId === block.id && element.offsetParent !== null);
      if (!card) { frame = requestAnimationFrame(reveal); return; }
      const rect = card.getBoundingClientRect();
      const position = [rect.top, rect.left, rect.width, rect.height].map(value => Math.round(value * 10)).join(":");
      stableFrames = position === lastPosition ? stableFrames + 1 : 0;
      lastPosition = position;
      if (stableFrames >= 3 && !revealed) {
        revealed = true;
        stableFrames = 0;
        card.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "nearest", inline: "nearest" });
      } else if (stableFrames >= 3 && revealed) {
        openHomeworkEditor(block, card, editRoutineRequest.occurrenceDate);
        onEditRequestHandled?.();
        return;
      }
      frame = requestAnimationFrame(reveal);
    };
    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [editRoutineRequest, routineBlocks, shouldReduceMotion]);

  useEffect(() => {
    if (!routineToFocus) return;
    const frame = requestAnimationFrame(() => {
      const card = Array.from(document.querySelectorAll<HTMLElement>("[data-routine-card-id]"))
        .find(element => element.dataset.routineCardId === routineToFocus && element.offsetParent !== null);
      focusVisibleRoutineCard(routineToFocus);
      const rect = card?.getBoundingClientRect();
      if (rect && (rect.top < 80 || rect.bottom > window.innerHeight - 48)) {
        card?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "nearest", inline: "nearest" });
      }
      setRoutineToFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [routineToFocus, mobileRoutineDay, shouldReduceMotion]);

  const visibleWeek = getWeekDates(weekAnchorDate);
  const routineDurationMinutes = getRoutineDurationMinutes(
    routineStart,
    routineEnd
  );
  const routineCanBeSaved =
    routineTitle.trim().length > 0 && routineDurationMinutes >= 30;
  const expandedRoutineDayIndex = visibleWeek.findIndex(
    (day) => day.value === expandedRoutineDay
  );
  const weeklyGridTemplate =
    expandedRoutineDayIndex === -1
      ? visibleWeek.map(() => "minmax(120px, 1fr)").join(" ")
      : visibleWeek
        .map((_, index) =>
          index === expandedRoutineDayIndex
            ? "minmax(250px, 1.9fr)"
            : "minmax(100px, 1fr)"
        )
        .join(" ");
  const claimRoutinePopup = usePlannerPopup(() => setRoutineToDelete(null));

  const safeAdditionalSubjects = additionalSubjects ?? [];

  const additionalSubjectStyles = {
    card: "bg-amber-50/45 border-amber-100/70 hover:border-amber-200",
    chapter: "bg-amber-50/40 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-amber-100/60",
    icon: "bg-amber-100 text-amber-600",
  };

  const routineSubjectOptions: SubjectPickerOption[] = [
    ...subjects.map((subject) => ({
      key: `subject:${subject.id}`,
      label: subject.name,
    })),
    ...safeAdditionalSubjects.map((subject) => ({
      key: `additional:${subject.id}`,
      label: subject.name,
      secondaryLabel: "Additional subject",
    })),
  ];

  const selectedRoutineSubjectKey = routineSubjectId
    ? `${subjects.some(subject => subject.id === routineSubjectId) ? "subject" : "additional"}:${routineSubjectId}`
    : safeAdditionalSubjects.find(
      (subject) => formatRoutineSubjectName(subject.name) === routineTitle
    )
      ? `additional:${safeAdditionalSubjects.find(
        (subject) => formatRoutineSubjectName(subject.name) === routineTitle
      )!.id
      }`
      : "";

  const handleRoutineSubjectSelect = (option: SubjectPickerOption) => {
    const [, id] = option.key.split(":");

    setRoutineTitle(formatRoutineSubjectName(option.label));
    setRoutineChapterId(null);

    setRoutineSubjectId(id);

  };

  return (
    <div
      className="planner-shell"
      id="study-planner-container"
    >
      {/* ------------------------------------------------------ */}
      {/* Weekly Routine */}
      {/* ------------------------------------------------------ */}

      <section className="planner-surface">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#eef0fa] text-[#5b57b7] rounded-xl">
              <CalendarDays className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                Weekly study plan
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                First, add your weekly study times. Then select a day’s study card to set its chapter and homework.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              ref={addButtonRef}
              type="button"
              onClick={toggleRoutineForm}
              aria-expanded={showRoutineForm}
              aria-controls="routine-add-form"
              className={`planner-focus planner-form-toggle ${showRoutineForm ? "planner-secondary" : "planner-primary"}`}
            >
              {showRoutineForm ? <X size={16} /> : <Plus size={16} />}
              <span>{showRoutineForm ? "Close" : "Add study time"}</span>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false} onExitComplete={() => {
          if (addedBlockRef.current) {
            const draft = addedBlockRef.current;
            const added = routineBlocks.find(block => block.dayOfWeek === draft.dayOfWeek && block.startTime === draft.startTime && block.title === draft.title);
            addedBlockRef.current = null;
            if (added) setRoutineToFocus(added.id);
          }
        }}>
          {showRoutineForm && (
            <motion.div
              id="routine-add-form"
              initial={shouldReduceMotion ? false : { height: 0, marginTop: 0, opacity: 0 }}
              animate={{ height: "auto", marginTop: 20, opacity: 1 }}
              exit={{ height: 0, marginTop: 0, opacity: 0 }}
              transition={{
                height: {
                  duration: shouldReduceMotion ? 0 : 0.42,
                  ease: [0.25, 0.1, 0.25, 1],
                },
                marginTop: {
                  duration: shouldReduceMotion ? 0 : 0.42,
                  ease: [0.25, 0.1, 0.25, 1],
                },
                opacity: {
                  duration: shouldReduceMotion ? 0 : 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
              className="overflow-hidden"
              onAnimationComplete={() => {
                if (formOpenRef.current) {
                  const active = document.activeElement;
                  if (!(active instanceof Element) || (!active.closest("#routine-add-form") && !active.closest("[data-planner-popup]"))) {
                    formHeadingRef.current?.focus({ preventScroll: true });
                  }
                  if (draftNeedsScroll.current) {
                    draftNeedsScroll.current = false;
                    formHeadingRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "center" });
                  }
                }
              }}
            >
              <motion.div
                className="planner-form space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 ref={formHeadingRef} tabIndex={-1} className="text-sm font-semibold text-slate-700 outline-none">
                    {weeklyEditingId ? "Edit a weekly study time" : "Add a weekly study time"}
                  </h3>
                </div>

                <div className="planner-form-fields">

                  {/* Day */}
                  <DayPicker
                    value={routineDay}
                    onChange={(value) => {
                      setRoutineDay(value);
                      setWeekAnchorDate(dateInViewedWeek(weekAnchorDate, Number(value)));
                      setMobileRoutineDay(Number(value));
                    }}
                    days={DAYS}
                    selectedDate={weekAnchorDate}
                    onDateSelect={handleRoutineDateSelect}
                  />

                  {/* Subject */}
                  <SubjectPicker
                    value={selectedRoutineSubjectKey}
                    options={routineSubjectOptions}
                    onChange={handleRoutineSubjectSelect}
                  />

                  {/* Start */}
                  <TimePicker
                    value={routineStart}
                    onChange={handleStartTimeChange}
                    label="Start"
                    closeOnPeriodChange
                  />

                  {/* End */}
                  <TimePicker
                    value={routineEnd}
                    onChange={setRoutineEnd}
                    label="End"
                  />
                </div>

                <div className="planner-form-context" aria-live="polite">
                  <span>Repeats every {getDayName(Number(routineDay))}{weeklyEditingId ? " · Saved dated homework stays unchanged" : ""}</span>
                  <span>{durationDescription(routineStart, routineEnd)}</span>
                </div>

                {/* Submit */}
                <div className="grid min-h-11 grid-cols-1 items-center md:grid-cols-[auto_minmax(0,1fr)] md:gap-3">
                  <button
                    type="button"
                    onClick={handleAddRoutine}
                    disabled={!routineCanBeSaved}
                    aria-describedby={!routineCanBeSaved ? "routine-save-hint" : undefined}
                    className="planner-focus planner-primary flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 md:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    {weeklyEditingId ? "Save weekly changes" : "Save weekly study time"}
                  </button>

                  {!routineCanBeSaved && !routineError && (
                    <p id="routine-save-hint" className="pt-2 text-center text-xs text-slate-500 md:pt-0 md:text-left">
                      Choose a subject and at least 30 minutes.
                    </p>
                  )}

                  <AnimatePresence initial={false}>
                    {routineError && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="min-w-0 overflow-hidden">
                        <div className="flex justify-center pt-2 md:pt-0">
                          <motion.div
                            ref={routineErrorRef}
                            role="alert"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 3 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="inline-flex min-h-11 w-fit max-w-full items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700"
                            title={routineError}
                          >
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                            <span>{routineError}</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {createPortal(
          <AnimatePresence>
            {routineToDelete && !isWideRoutineBoard && (() => {
              return (
                <motion.div
                  key={`routine-sheet-${routineToDelete.id}`}
                  className="fixed inset-0 z-[120]"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.2 } },
                    closed: { opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.16 } },
                  }}
                >
                  <button type="button" aria-label="Close routine details" className="routine-sheet-backdrop absolute inset-0 w-full cursor-default bg-slate-900/20" onClick={() => closeRoutineMenu()} />
                  <motion.div
                    ref={mobileRoutineSheetRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Details for ${routineToDelete.title}`}
                    className="routine-detail-sheet fixed inset-x-0 bottom-0 z-[121] mx-auto max-w-xl rounded-t-3xl border border-slate-200 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
                    variants={{
                      open: { y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] } },
                      closed: { y: "100%", transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: [0.4, 0, 1, 1] } },
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden="true" />
                    <div className={`rounded-2xl border px-4 py-3 text-center ${getRoutineBlockCardStyle(routineToDelete)}`}>
                      <div className={`text-xs font-semibold tabular-nums ${getRoutineBlockTimeStyle(routineToDelete)}`}>{formatCompactTimeRange(routineToDelete.startTime, routineToDelete.endTime)}</div>
                      <div className="mt-1 text-base font-semibold text-slate-800">{getMotherRoutineTitle(routineToDelete)}</div>
                    </div>
                    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                      Homework applies to this date. Weekly changes affect repeating times; saved dated records are kept.
                    </p>
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      {renderRoutineActions(routineToDelete, routineMenuDateKey ?? "", true)}
                    </div>
                    <button type="button" onClick={() => closeRoutineMenu()} className="planner-focus planner-sheet-close mt-3 w-full rounded-lg py-2 text-sm font-medium text-slate-500">Close</button>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}

        {createPortal(
          <AnimatePresence>
            {homeworkEditorBlockId && isHomeworkChapterPickerOpen && (() => {
              const block = routineBlocks.find((item) => item.id === homeworkEditorBlockId);
              if (!block) return null;

              const subject = getRoutineBlockSubject(block);

              return (
                <motion.div
                  ref={homeworkEditorRef}
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                  aria-label={`Choose homework chapter for ${getMotherRoutineTitle(block)}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.985 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="planner-popup fixed z-[125] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                  style={{
                    top: homeworkEditorPosition.top,
                    left: homeworkEditorPosition.left,
                    width: homeworkEditorPosition.width,
                    maxHeight: homeworkEditorPosition.maxHeight,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800">
                        {getMotherRoutineTitle(block)}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Choose the chapter for this homework.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => closeHomeworkEditor(true)}
                      className="planner-focus shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Cancel homework editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {subject ? (
                    <div className="px-3 py-3">
                      <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Chapters
                      </div>
                      <div className="max-h-[322px] space-y-1.5 overflow-y-auto pr-1">
                        {subject.chapters.length > 0 ? (
                          subject.chapters.map((chapter) => {
                            const selected = chapter.id === homeworkChapterId;
                            return (
                              <button
                                key={chapter.id}
                                type="button"
                                onClick={() => selectHomeworkChapter(block, chapter.id)}
                                className={`planner-focus flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[13px] transition ${selected
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
                                  }`}
                              >
                                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-bold text-slate-600">
                                  {formatChapterNumber(chapter.chapterNumber)}
                                </span>
                                <span lang="bn" className="min-w-0 flex-1 font-medium">
                                  {chapter.banglaName}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-500">
                            No chapter data is available for this subject yet.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-sm leading-relaxed text-slate-600">
                      This routine does not link to an official curriculum subject, so no chapter list can be shown.
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}

        {createPortal(
          <AnimatePresence>
            {deleteConfirmation && (
              <motion.div
                className="fixed inset-0 z-[150] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              >
                <button
                  type="button"
                  aria-label="Keep this item"
                  onClick={() => setDeleteConfirmation(null)}
                  className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[1px]"
                />
                <motion.div
                  ref={deleteConfirmationRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-confirmation-title"
                  aria-describedby="delete-confirmation-description"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <h3
                      id="delete-confirmation-title"
                      className="text-sm font-semibold text-slate-800"
                    >
                      {deleteConfirmation === "homework"
                        ? "Delete this homework?"
                        : "Delete this weekly study time?"}
                    </h3>
                  </div>

                  <p
                    id="delete-confirmation-description"
                    className="mx-auto mt-2 max-w-[240px] text-center text-xs leading-relaxed text-slate-500"
                  >
                    {deleteConfirmation === "homework"
                      ? "Its chapter and homework for this date will be removed."
                      : "This study time will no longer repeat. Saved homework records stay in your study log."}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation(null)}
                      className="planner-focus min-w-24 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Keep
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = deleteConfirmation;
                        setDeleteConfirmation(null);
                        if (target === "homework") deleteRoutineHomework();
                        else deleteRoutineWithUndo();
                      }}
                      className="planner-focus min-w-24 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      {deleteConfirmation === "homework" ? "Delete HW" : "Delete"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Weekly Routine Board */}
        <div id="planner-week-board" ref={routineBoardRef} tabIndex={-1} className="planner-board">
          <div className="planner-board-heading">
            <p className="text-xs leading-relaxed text-slate-500">Weekly times repeat. Homework belongs to one date.</p>
            <div className="planner-week-controls flex items-center gap-1.5">
              <button
                type="button"
                className="planner-focus planner-text-action"
                onClick={() => {
                  closeHomeworkEditor();
                  closeRoutineMenu();
                  const today = toDayStart(new Date());
                  setWeekAnchorDate(today);
                  setMobileRoutineDay(today.getDay());
                  setExpandedRoutineDay(today.getDay());
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="planner-focus planner-week-nav-button"
                aria-label="Previous week"
                onClick={() => {
                  closeHomeworkEditor();
                  closeRoutineMenu();
                  const previousWeek = new Date(weekAnchorDate);
                  previousWeek.setDate(previousWeek.getDate() - 7);
                  setWeekMotionDirection("previous");
                  setWeekAnchorDate(previousWeek);
                  setMobileRoutineDay(previousWeek.getDay());
                  setExpandedRoutineDay(previousWeek.getDay());
                }}
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <span aria-live="polite" className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {visibleWeek[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–{visibleWeek[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <button
                type="button"
                className="planner-focus planner-week-nav-button"
                aria-label="Next week"
                onClick={() => {
                  closeHomeworkEditor();
                  closeRoutineMenu();
                  const nextWeek = new Date(weekAnchorDate);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setWeekMotionDirection("next");
                  setWeekAnchorDate(nextWeek);
                  setMobileRoutineDay(nextWeek.getDay());
                  setExpandedRoutineDay(nextWeek.getDay());
                }}
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Mobile day selector */}
          <div ref={dayTabsRef} className="planner-day-tabs flex snap-x gap-2 overflow-x-auto pb-2">
            {visibleWeek.map((day) => {
              const isSelected = mobileRoutineDay === day.value;
              const isToday = isSameCalendarDate(day.date, new Date());

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => { closeHomeworkEditor(); closeRoutineMenu(); setMobileRoutineDay(day.value); }}
                  aria-pressed={isSelected}
                  aria-label={`${day.label}, ${day.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}${isToday ? ", today" : ""}`}
                  className={`planner-focus planner-day-option min-w-20 shrink-0 snap-start rounded-lg border px-3 py-2 text-center transition ${isSelected
                    ? "border-indigo-500 bg-[#eef1ff] text-indigo-700"
                    : isToday
                      ? "border-sky-200 bg-sky-50/70 text-slate-700"
                      : "border-[#dce5f4] bg-[#fcfdfe] text-slate-600"
                    }`}
                >
                  <div className="text-xs font-semibold">
                    {day.label.slice(0, 3)}
                  </div>

                  <div className={`text-xs ${isToday ? "font-semibold text-sky-700" : "text-slate-500"}`}>
                    {isToday ? (
                      <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />Today</span>
                    ) : day.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={localDateKey(visibleWeek[0].date)}
              initial={shouldReduceMotion ? false : { opacity: 0, x: weekMotionDirection === "next" ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: weekMotionDirection === "next" ? -8 : 8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="planner-week-grid"
              style={{ gridTemplateColumns: weeklyGridTemplate }}
            >
              {visibleWeek.map((day) => {
                const dayBlocks = getScheduledRoutineTasks(localDateKey(day.date), routineBlocks, dailyRoutineTasks, subjects, additionalSubjects).map(task => task.block);

                const isToday = isSameCalendarDate(day.date, new Date());
                const isSelectedDate = isSameCalendarDate(day.date, weekAnchorDate);
                const isExpanded = expandedRoutineDay === day.value;

                return (
                  <motion.div
                    key={day.value}
                    data-expanded={isExpanded}
                    className={`planner-day-column min-h-[180px] rounded-xl border p-2.5 text-center ${isSelectedDate
                      ? "border-indigo-300 bg-[#eef2ff]"
                      : isToday
                        ? "border-sky-200 bg-sky-50/60"
                        : "border-slate-200 bg-[#fbfcfe]"
                      }`}
                  >
                    {/* Day header */}
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${day.label}, ${day.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
                      onClick={() => {
                        closeHomeworkEditor();
                        closeRoutineMenu();
                        setExpandedRoutineDay(isExpanded ? null : day.value);
                        setMobileRoutineDay(day.value);
                        setWeekAnchorDate(day.date);
                      }}
                      className={`mb-3 border-b pb-2 ${isSelectedDate ? "border-indigo-200" : isToday ? "border-sky-100" : "border-slate-200"
                        } planner-day-header`}
                    >
                      <div
                        className={`text-sm font-semibold tracking-tight ${isSelectedDate ? "text-indigo-700" : isToday ? "text-sky-800" : "text-slate-800"
                          }`}
                      >
                        {day.label}
                      </div>

                      <div className={`text-xs ${isToday ? "font-semibold text-sky-700" : "text-slate-500"}`}>
                        {isToday ? (
                          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />Today</span>
                        ) : day.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                    </button>
                    {/* A single keyed card stays mounted throughout day expansion. */}
                    <div className="space-y-2">
                      {dayBlocks.length > 0 ? dayBlocks.map(block => renderDatedRoutineCard(block, day.date, isExpanded)) : (
                        <div className="planner-empty-day rounded-lg border border-dashed border-slate-200 px-2 py-4 text-center">
                          <p className="text-xs text-slate-500">No study times</p>
                          <button type="button" aria-label={`Add study time for ${day.label}`}
                            onClick={() => openRoutineFormForDate(day.date, true)}
                            className="planner-focus mt-2 rounded-lg px-2 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50">Add study time</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
          {/* Mobile selected-day routine */}
          <div className="planner-selected-day">
            {(() => {
              const selectedDay =
                visibleWeek.find((day) => day.value === mobileRoutineDay) ??
                visibleWeek[0];

              const selectedDayBlocks = getScheduledRoutineTasks(localDateKey(selectedDay.date), routineBlocks, dailyRoutineTasks, subjects, additionalSubjects).map(task => task.block);

              return (
                <motion.div
                  key={localDateKey(selectedDay.date)}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-4">
                    <div className="text-base font-semibold text-slate-800">
                      {selectedDay.label}
                    </div>

                    <div className="text-xs text-slate-500">
                      {selectedDay.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {selectedDayBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayBlocks.map(block => renderDatedRoutineCard(block, selectedDay.date, true, true))}
                    </div>
                  ) : (
                    <div className="planner-empty-day rounded-lg border border-dashed border-slate-200 px-4 py-7 text-center">
                      <CalendarDays className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                      <p className="mt-2 text-sm text-slate-600">No study time planned for {selectedDay.label}.</p>
                      <button
                        type="button"
                        onClick={() => openRoutineFormForDate(selectedDay.date, true)}
                        className="planner-focus mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Add study time
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </div>

        </div>

      </section>

      {createPortal(
        <AnimatePresence>
          {(deletedRoutine || homeworkUndo) && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="routine-undo fixed bottom-5 left-1/2 z-[130] flex w-[min(360px,calc(100vw-32px))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
            >
              <span className="min-w-0 text-sm font-medium text-slate-700">{homeworkUndo ? "Homework cleared for this date." : "Weekly time deleted. Saved homework kept."}</span>
              <button type="button" onClick={() => {
                if (homeworkUndo) {
                  if (onSaveDatedRoutineTask(homeworkUndo)) setHomeworkUndo(null);
                } else undoRoutineDelete();
              }} className="planner-focus shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Undo</button>
              <button type="button" aria-label="Dismiss undo message" onClick={() => { setHomeworkUndo(null); setDeletedRoutine(null); }} className="planner-focus rounded-lg p-2 text-slate-500"><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>

  );
}
