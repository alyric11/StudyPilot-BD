import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

import {
  UserProfile,
  AdditionalSubject,
  RoutineBlock
} from "../types";

import {
  CalendarDays,
  Plus,
  X,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import TimePicker from "./TimePicker";
import DayPicker from "./DayPicker";

import { Subject } from "../data/curriculum";
import {
  getSubjectCardStyles,
  getSubjectRoutineStyles,
  getSubjectAccentColor,
} from "../colorPalettes";
import {
  FloatingPlacement,
  getSideAwareFloatingPosition,
} from "../utils/floatingPosition";
import { formatTimeRange } from "../utils/time";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Subject[];
  additionalSubjects?: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  onAddRoutineBlock: (
    newBlock: Omit<RoutineBlock, "id">
  ) => void;
  onDeleteRoutineBlock: (id: string) => void;
  onUpdateRoutineBlock: (
    id: string,
    updatedBlock: Omit<RoutineBlock, "id">
  ) => void;
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

const getWeekDates = () => {
  const today = new Date();
  const todayDay = today.getDay();

  // Saturday is the first day of our StudyPilot BD week.
  const daysFromSaturday = (todayDay + 1) % 7;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromSaturday);

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
  onAddRoutineBlock,
  onDeleteRoutineBlock,
  onUpdateRoutineBlock,
  onBackToDashboard
}: StudyPlannerProps) {
  const shouldReduceMotion = useReducedMotion();

  // ------------------------------------------------------------
  // Weekly Routine
  // ------------------------------------------------------------

  const [routineDay, setRoutineDay] = useState("6");
  const [mobileRoutineDay, setMobileRoutineDay] = useState(
    new Date().getDay()
  );
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineSubjectId, setRoutineSubjectId] = useState<string | null>(null);
  const [routineStart, setRoutineStart] = useState("17:00");
  const [routineEnd, setRoutineEnd] = useState("18:00");
  const [endPickerOpenRequest, setEndPickerOpenRequest] = useState(0);
  const [routineError, setRoutineError] = useState<string | null>(null);
  const routineErrorRef = React.useRef<HTMLDivElement>(null);
  const routineMenuRef = React.useRef<HTMLDivElement>(null);
  const [routineToDelete, setRoutineToDelete] =
    useState<RoutineBlock | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineMenuPosition, setRoutineMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 176,
    maxHeight: 148,
    placement: "right" as FloatingPlacement,
  });
  const [isRoutineMenuClosing, setIsRoutineMenuClosing] = useState(false);

  useEffect(() => {
    if (!routineError) return;

    const dismissRoutineError = (event: MouseEvent) => {
      if (!routineErrorRef.current?.contains(event.target as Node)) {
        setRoutineError(null);
      }
    };

    document.addEventListener("mousedown", dismissRoutineError);
    return () => document.removeEventListener("mousedown", dismissRoutineError);
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

  const getRoutineDurationMinutes = (startTime: string, endTime: string) => {
    const minutesPerDay = 24 * 60;
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end === start) return 0;

    return end > start ? end - start : minutesPerDay - start + end;
  };

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

  const handleStartPeriodChange = (startTime: string) => {
    const minutesInDay = 24 * 60;
    const endMinutes = (timeToMinutes(startTime) + 60) % minutesInDay;
    const endHours = Math.floor(endMinutes / 60);
    const endMinutePart = endMinutes % 60;

    setRoutineEnd(
      `${String(endHours).padStart(2, "0")}:${String(endMinutePart).padStart(2, "0")}`
    );
    setEndPickerOpenRequest((request) => request + 1);
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
    const linkedSubject = subjects.find((subject) => subject.id === block.subjectId);

    if (linkedSubject) {
      return linkedSubject;
    }

    const normalizedTitle = block.title.trim().toLowerCase();

    return subjects.find((subject) => {
      const compactName = formatRoutineSubjectName(subject.name).toLowerCase();

      return (
        normalizedTitle === compactName ||
        normalizedTitle.startsWith(`${compactName}:`)
      );
    });
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

  const getRoutineBlockTimeStyle = (block: RoutineBlock) => {
    const matchingSubject = getRoutineBlockSubject(block);

    if (matchingSubject) {
      return getSubjectRoutineStyles(matchingSubject.color).time;
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
      return "text-amber-600";
    }

    return (
      ROUTINE_COLOR_STYLES[block.color as keyof typeof ROUTINE_COLOR_STYLES]?.time ??
      "text-slate-600"
    );
  };

  const toggleRoutineForm = () => {
    const nextOpenState = !showRoutineForm;

    setRoutineError(null);
    setEndPickerOpenRequest(0);

    if (nextOpenState) {
      setEditingRoutineId(null);
    }

    setShowRoutineForm(nextOpenState);
  };

  const handleAddRoutine = () => {
    setRoutineError(null);

    const title = routineTitle.trim();

    if (!title) {
      setRoutineError("Enter an activity.");
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
      startTime: routineStart,
      endTime: routineEnd,
      color,
    };

    onAddRoutineBlock(updatedRoutine);

    setRoutineTitle("");
    setRoutineSubjectId(null);
    setEndPickerOpenRequest(0);
    setShowRoutineForm(false);
  };

  const focusVisibleRoutineCard = (routineId: string) => {
    const routineCard = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-routine-card-id="${routineId}"]`
      )
    ).find((card) => card.offsetParent !== null);

    routineCard?.focus();
  };

  const closeRoutineMenu = (afterClose?: () => void) => {
    if (!routineToDelete || isRoutineMenuClosing) return;

    setIsRoutineMenuClosing(true);
    setTimeout(() => {
      setRoutineToDelete(null);
      setIsRoutineMenuClosing(false);
      afterClose?.();
    }, shouldReduceMotion ? 0 : 200);
  };

  const openRoutineMenu = (
    cardElement: HTMLDivElement,
    block: RoutineBlock
  ) => {
    const card = cardElement.getBoundingClientRect();
    setRoutineMenuPosition(
      getSideAwareFloatingPosition(card, 176, 148, 8, 8)
    );
    setIsRoutineMenuClosing(false);
    setRoutineToDelete(block);
  };

  useEffect(() => {
    if (!routineToDelete || isRoutineMenuClosing) return;

    const frame = window.requestAnimationFrame(() => {
      routineMenuRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus();
    });

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !routineMenuRef.current?.contains(target) &&
        !target.closest("[data-routine-card-id]")
      ) {
        closeRoutineMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isRoutineMenuClosing, routineToDelete]);

  const handleRoutineMenuKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const routineId = routineToDelete?.id;
      closeRoutineMenu(() => {
        if (!routineId) return;
        focusVisibleRoutineCard(routineId);
      });
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const items = Array.from(
      routineMenuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]'
      ) ?? []
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % items.length;
    }
    if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    }

    items[nextIndex]?.focus();
  };

  const startEditingRoutine = () => {
    if (!routineToDelete) return;

    const block = routineToDelete;
    closeRoutineMenu(() => {
      setShowRoutineForm(false);
      setRoutineError(null);
      setRoutineTitle("");
      setRoutineSubjectId(null);
      setEndPickerOpenRequest(0);
      setEditingRoutineId(block.id);
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>("[data-subject-card]")
          ?.focus();
      });
    });
  };

  const renderRoutineTitle = (title: string) => {
    const colonIndex = title.indexOf(":");

    if (colonIndex === -1) {
      return <span className="whitespace-nowrap">{title}</span>;
    }

    const subjectPart = title.slice(0, colonIndex + 1);
    const chapterPart = title.slice(colonIndex + 1).trimStart();

    return (
      <span className="flex w-full flex-wrap justify-center gap-x-1 gap-y-0 leading-tight">
        <span className="whitespace-nowrap">{subjectPart}</span>
        <span className="whitespace-nowrap">{chapterPart}</span>
      </span>
    );
  };

  const sortedRoutineBlocks = [...routineBlocks].sort(
    (a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }

      return (
        timeToMinutes(a.startTime) -
        timeToMinutes(b.startTime)
      );
    }
  );


  // ------------------------------------------------------------
  // Subjects & Chapters
  // ------------------------------------------------------------

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [chapterTrigger, setChapterTrigger] = useState<HTMLButtonElement | null>(
    null
  );
  const chapterPopoverRef = React.useRef<HTMLDivElement>(null);
  const [chapterPopoverPosition, setChapterPopoverPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 360,
    placement: "right" as FloatingPlacement,
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".chapter-popover")) {
        setExpandedSubjectId(null);
        setChapterTrigger(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!expandedSubjectId || !chapterTrigger) return;

    const updateChapterPosition = () => {
      const triggerRect = chapterTrigger.getBoundingClientRect();
      const measuredHeight = chapterPopoverRef.current?.offsetHeight || 360;

      setChapterPopoverPosition(
        getSideAwareFloatingPosition(
          triggerRect,
          triggerRect.width,
          measuredHeight
        )
      );
    };

    updateChapterPosition();
    const frame = window.requestAnimationFrame(() => {
      const firstChapter = chapterPopoverRef.current?.querySelector<HTMLElement>(
        "[data-chapter-option]"
      );

      (firstChapter ?? chapterPopoverRef.current)?.focus();
    });
    window.addEventListener("resize", updateChapterPosition);
    window.addEventListener("scroll", updateChapterPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateChapterPosition);
      window.removeEventListener("scroll", updateChapterPosition, true);
    };
  }, [chapterTrigger, expandedSubjectId]);

  const closeChapterPopover = (restoreFocus = false) => {
    const trigger = chapterTrigger;
    setExpandedSubjectId(null);
    setChapterTrigger(null);

    if (restoreFocus) {
      trigger?.focus();
    }
  };

  const handleChapterPopoverKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeChapterPopover(true);
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    const chapters = Array.from(
      chapterPopoverRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-chapter-option]"
      ) ?? []
    );

    if (chapters.length === 0) return;

    event.preventDefault();
    const currentIndex = chapters.indexOf(
      document.activeElement as HTMLButtonElement
    );
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = chapters.length - 1;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % chapters.length;
    }
    if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + chapters.length) % chapters.length;
    }

    chapters[nextIndex]?.focus();
  };

  const safeAdditionalSubjects = additionalSubjects ?? [];

  const additionalSubjectStyles = {
    card: "bg-amber-50/45 border-amber-100/70 hover:border-amber-200",
    chapter: "bg-amber-50/40 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-amber-100/60",
    icon: "bg-amber-100 text-amber-600",
  };

  const formatChapterNumber = (chapterNumber: string) => {
    const trimmed = chapterNumber.trim();

    if (/^chapter\s+/i.test(trimmed)) {
      return trimmed.replace(/^chapter\s+/i, "Ch-");
    }

    if (/^lesson\s+/i.test(trimmed)) {
      return trimmed.replace(/^lesson\s+/i, "Less-");
    }

    if (/^question\s+/i.test(trimmed)) {
      return trimmed.replace(/^question\s+/i, "Ques-");
    }

    if (/^ch[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^ch[-\s]?/i, "Ch-");
    }

    if (/^less[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^less[-\s]?/i, "Less-");
    }

    if (/^ques[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^ques[-\s]?/i, "Ques-");
    }

    return `Ch-${trimmed}`;
  };

  const toggleSubject = (
    subjectId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
      setChapterTrigger(null);
      return;
    }

    const card = event.currentTarget.getBoundingClientRect();
    setChapterPopoverPosition(
      getSideAwareFloatingPosition(card, card.width, 360)
    );
    setChapterTrigger(event.currentTarget);
    setExpandedSubjectId(subjectId);
  };

  const formatRoutineSubjectName = (subjectName: string) => {
    const words = subjectName.trim().split(/\s+/).filter(Boolean);

    // Examples:
    // Bangla 2nd Paper -> Bangla-2
    // English 1st Paper -> English-1
    // Higher Mathematics -> HM
    // ICT -> ICT
    const paperNumberIndex = words.findIndex((word) =>
      /^(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th)$/i.test(word)
    );

    if (paperNumberIndex > 0) {
      const baseName = words
        .slice(0, paperNumberIndex)
        .map((word) => word.replace(/[^A-Za-z]/g, ""))
        .filter(Boolean)
        .join(" ");

      return `${baseName}-${words[paperNumberIndex].replace(/\D/g, "")}`;
    }

    if (words.length === 1) {
      return words[0];
    }

    return words
      .map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase())
      .filter(Boolean)
      .join("");
  };

  const scrollRoutineCardIntoView = (routineId: string) => {
    window.setTimeout(() => {
      const routineCard = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-routine-card-id="${routineId}"]`
        )
      ).find((card) => card.offsetParent !== null);

      routineCard?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "center",
      });
      routineCard?.focus();
    }, 0);
  };

  const replaceRoutineSubject = (
    routineId: string,
    title: string,
    subjectId: string | undefined,
    color: string | undefined
  ) => {
    const routineBeingEdited = routineBlocks.find(
      (block) => block.id === routineId
    );

    if (!routineBeingEdited) {
      setEditingRoutineId(null);
      setExpandedSubjectId(null);
      return;
    }

    onUpdateRoutineBlock(routineId, {
      dayOfWeek: routineBeingEdited.dayOfWeek,
      title,
      subjectId,
      startTime: routineBeingEdited.startTime,
      endTime: routineBeingEdited.endTime,
      color: color ?? routineBeingEdited.color,
    });

    setEditingRoutineId(null);
    setExpandedSubjectId(null);
    scrollRoutineCardIntoView(routineId);
  };

  const handleChapterSelect = (
    subjectId: string,
    subjectName: string,
    chapterNumber: string
  ) => {
    if (!showRoutineForm && !editingRoutineId) {
      return;
    }

    const title = `${formatRoutineSubjectName(subjectName)}: ${formatChapterNumber(
      chapterNumber
    )}`;

    if (editingRoutineId) {
      const selectedSubject = subjects.find(
        (subject) => subject.id === subjectId
      );

      replaceRoutineSubject(
        editingRoutineId,
        title,
        subjectId,
        getRoutineColorForSubject(selectedSubject?.color ?? "") ?? undefined
      );
      return;
    }

    setRoutineTitle(title);
    setRoutineSubjectId(subjectId);
    setExpandedSubjectId(null);
  };

  const handleAdditionalSubjectSelect = (subjectName: string) => {
    const title = formatRoutineSubjectName(subjectName);

    if (editingRoutineId) {
      replaceRoutineSubject(editingRoutineId, title, undefined, "amber");
      return;
    }

    if (!showRoutineForm) {
      return;
    }

    setRoutineTitle(title);
    setRoutineSubjectId(null);
    setExpandedSubjectId(null);
  };

  const renderSubjectCard = (
    subject: Subject,
    cardIndex: number
  ) => {
    const isExpanded = expandedSubjectId === subject.id;
    const styles = getSubjectCardStyles(subject.color);
    const subjectAccent = getSubjectAccentColor(subject.color);

    return (
      <div
        key={`${subject.id}-${cardIndex}`}
        className="relative min-w-0"
      >
        {isExpanded && createPortal(
          <div
            ref={chapterPopoverRef}
            id={`chapter-picker-${subject.id}`}
            role="dialog"
            aria-label={`Choose a chapter from ${subject.name}`}
            tabIndex={-1}
            onKeyDown={handleChapterPopoverKeyDown}
            className={`chapter-popover routine-dropdown fixed z-[110] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${
              chapterPopoverPosition.placement === "above"
                ? "routine-dropdown-above routine-dropdown-opening-up"
                : "routine-dropdown-opening"
            }`}
            style={{
              top: chapterPopoverPosition.top,
              left: chapterPopoverPosition.left,
              width: chapterPopoverPosition.width || undefined,
              maxHeight: chapterPopoverPosition.maxHeight,
              borderColor: `${subjectAccent}55`,
              boxShadow: `0 18px 30px -18px ${subjectAccent}66, inset 0 0 0 1px ${subjectAccent}26`,
              ["--chapter-accent" as string]: subjectAccent,
            }}
          >
            <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
              <div className={`rounded-lg p-1.5 ${styles.icon}`}>
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-800">
                  {subject.name}
                </div>
                <div className="text-[10px] font-medium text-slate-400">
                  Select a chapter
                </div>
              </div>
            </div>

            <div
              className="mx-3 h-px shrink-0"
              style={{
                backgroundColor: `${subjectAccent}80`,
                boxShadow: `0 1px 0 ${subjectAccent}24`,
              }}
            />

            {subject.chapters.length > 0 ? (
              <div className="chapter-popover-scroll max-h-[280px] min-h-0 flex-1 space-y-1 overflow-y-auto pb-3 pl-3 pr-1 pt-2">
                {subject.chapters.map((chapter) => (
                  <button
                    type="button"
                    key={chapter.id}
                    data-chapter-option
                    onClick={() =>
                      handleChapterSelect(
                        subject.id,
                        subject.name,
                        chapter.chapterNumber
                      )
                    }
                    className={`planner-focus flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[11px] transition cursor-pointer ${styles.chapter}`}
                  >
                    <span className={`shrink-0 rounded-md px-1.5 py-1 text-[10px] font-bold ${styles.icon}`}>
                      {formatChapterNumber(chapter.chapterNumber)}
                    </span>{" "}
                    <span className="min-w-0 flex-1 font-medium">{chapter.banglaName}</span>
                    <span className="text-sm text-slate-400">›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-[11px] text-slate-400">
                No chapter data is available for this subject yet.
              </div>
            )}
          </div>,
          document.body
        )}

        <button
          type="button"
          onClick={(event) => toggleSubject(subject.id, event)}
          data-subject-card
          aria-haspopup="dialog"
          aria-expanded={isExpanded}
          aria-controls={`chapter-picker-${subject.id}`}
          className={`planner-focus w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm transition-all cursor-pointer ${styles.card}`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`rounded-lg p-1.5 shrink-0 ${styles.icon}`}>
              <BookOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-slate-800 truncate">
                {subject.name}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">
                {isExpanded ? "Hide chapters" : "View chapters"}
              </div>
            </div>

            <span
              className={`text-slate-400 text-base transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
              aria-hidden="true"
            >
              ›
            </span>
          </div>
        </button>
      </div>
    );
  };

  const renderAdditionalSubjectCard = (
    subject: AdditionalSubject,
    cardIndex: number
  ) => (
    <button
      type="button"
      key={`${subject.id}-${cardIndex}`}
      onClick={() => handleAdditionalSubjectSelect(subject.name)}
      data-subject-card
      aria-label={`${subject.name}, additional subject`}
      className={`planner-focus w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm transition-all cursor-pointer ${additionalSubjectStyles.card}`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`rounded-lg p-1.5 shrink-0 ${additionalSubjectStyles.icon}`}>
          <BookOpen className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-slate-800 truncate">
            {subject.name}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            Additional subject
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div
      className="space-y-5 rounded-2xl border border-[#dce5f4] bg-[#fcfdfe] p-3 shadow-sm sm:space-y-6 sm:p-4 lg:space-y-8 lg:p-6"
      id="study-planner-container"
    >
      {/* ------------------------------------------------------ */}
      {/* Weekly Routine */}
      {/* ------------------------------------------------------ */}

      <section className="rounded-2xl bg-[#f7f9fe] p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col gap-3 border-b border-[#dce5f4] pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#edf3ff] text-indigo-600 rounded-xl">
              <CalendarDays className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                Weekly Routine
              </h2>

              <p className="text-slate-400 text-xs">
                Create your own recurring weekly schedule.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={toggleRoutineForm}
            aria-expanded={showRoutineForm}
            aria-controls="routine-add-form"
            animate={{
              scale: 1,
              width: showRoutineForm ? "6.25rem" : "12.5rem",
            }}
            transition={{
              scale: { duration: shouldReduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] },
              width: { duration: shouldReduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] },
            }}
            className={`planner-focus relative h-11 self-start rounded-xl text-sm font-semibold transition-colors cursor-pointer sm:self-auto ${
              showRoutineForm
                ? "border border-indigo-200 bg-white text-indigo-600 shadow-none hover:border-indigo-300 hover:bg-indigo-50"
                : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
            }`}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.span
                key={showRoutineForm ? "close" : "add"}
                initial={shouldReduceMotion ? false : { opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center gap-1.5"
              >
                {showRoutineForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showRoutineForm ? "Close" : "Add Routine Block"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {showRoutineForm && (
            <motion.div
              id="routine-add-form"
              initial={shouldReduceMotion ? false : { height: 0, marginTop: 0, opacity: 0 }}
              animate={{ height: "auto", marginTop: 20, opacity: 1 }}
              exit={{ height: 0, marginTop: 0, opacity: 0 }}
              transition={{
                height: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] },
                marginTop: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: shouldReduceMotion ? 0 : 0.18, ease: "linear" },
              }}
              className="overflow-hidden will-change-[height]"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { y: -6 }}
                animate={{ y: 0 }}
                exit={{ y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3 rounded-xl border border-[#c9daf9] bg-[#edf3ff] p-3 sm:p-4"
              >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Add an activity to your schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-[1.15fr_1.6fr_1.15fr_1.15fr]">

              {/* Day */}
              <DayPicker value={routineDay} onChange={setRoutineDay} days={DAYS} />

              {/* Activity */}
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3">
                <span className="text-sm font-semibold text-slate-600">
                  Activity
                </span>

                <span className="mx-3 h-5 w-px bg-slate-200" />

                <BookOpen className="h-4 w-4 shrink-0 text-purple-500" />

                <span className="mx-3 h-5 w-px bg-slate-200" />

                <input
                  type="text"
                  value={routineTitle}
                  onChange={(e) => {
                    setRoutineTitle(e.target.value);
                    setRoutineSubjectId(null);
                  }}
                  placeholder="e.g. Chemistry"
                  aria-label="Routine activity"
                  className="planner-focus min-w-0 flex-1 rounded-sm bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Start */}
              <TimePicker
                value={routineStart}
                onChange={setRoutineStart}
                label="Start"
                onPeriodChange={handleStartPeriodChange}
                closeOnPeriodChange
              />

              {/* End */}
              <TimePicker
                value={routineEnd}
                onChange={setRoutineEnd}
                label="End"
                openRequest={endPickerOpenRequest}
                onOpenRequestHandled={() => setEndPickerOpenRequest(0)}
              />
            </div>

            {/* Submit */}
            <div className="grid min-h-11 grid-cols-1 items-center gap-2 md:grid-cols-[auto_minmax(0,1fr)] md:gap-3">
              <button
                type="button"
                onClick={handleAddRoutine}
                className="planner-focus flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 md:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add to Weekly Routine
              </button>

              <AnimatePresence initial={false}>
                {routineError && (
                  <div className="flex min-w-0 justify-center">
                    <motion.div
                      ref={routineErrorRef}
                      role="alert"
                      initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-flex h-11 w-fit max-w-full origin-center items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-3 text-[11px] text-rose-700 sm:text-xs"
                      title={routineError}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span className="truncate">{routineError}</span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------ */}
      {/* Subjects & Chapters */}
      {/* ------------------------------------------------------ */}

      <section className="pt-2 border-t border-[#e6edf8]">
        <div className="rounded-2xl border border-[#dce5f4] bg-white p-3 sm:p-4 lg:p-5">
          <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-800">
                Active Subjects
              </h2>
              <p
                className="mt-0.5 text-xs text-slate-400"
                role="status"
                aria-live="polite"
              >
                {editingRoutineId ? (
                  <>
                    <span className="font-semibold text-indigo-600">Editing:</span>{" "}
                    choose a subject and chapter. The saved day and time will not change.
                  </>
                ) : showRoutineForm ? (
                  <>
                    <span className="font-semibold text-slate-600">Adding:</span>{" "}
                    choose a subject and chapter, or type an activity above.
                  </>
                ) : (
                  <>
                    To add, open <span className="font-semibold text-slate-600">Add Routine Block</span>.
                    To edit, select a routine card and choose <span className="font-semibold text-slate-600">Edit</span>.
                  </>
                )}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-[#dce5f4] bg-[#f4f7fc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
              {subjects.length + safeAdditionalSubjects.length} subjects
            </span>
          </div>

          {subjects.length + safeAdditionalSubjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {subjects.map((subject, index) =>
                renderSubjectCard(subject, index)
              )}

              {safeAdditionalSubjects.map((subject, index) =>
                renderAdditionalSubjectCard(subject, index)
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-5 text-center text-xs text-slate-400">
              No active subjects available.
            </div>
          )}

        </div>
      </section>

      {routineToDelete && createPortal(
        <div
          ref={routineMenuRef}
          id="routine-actions-menu"
          role="menu"
          aria-label={`Actions for ${routineToDelete.title}`}
          onKeyDown={handleRoutineMenuKeyDown}
          className={`routine-dropdown fixed z-[110] overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${
            routineMenuPosition.placement === "above"
              ? "routine-dropdown-above"
              : ""
          } ${
            isRoutineMenuClosing
              ? routineMenuPosition.placement === "above"
                ? "routine-dropdown-closing-up"
                : "routine-dropdown-closing"
              : routineMenuPosition.placement === "above"
                ? "routine-dropdown-opening-up"
                : "routine-dropdown-opening"
          }`}
          style={{
            top: routineMenuPosition.top,
            left: routineMenuPosition.left,
            width: routineMenuPosition.width,
            maxHeight: routineMenuPosition.maxHeight,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={startEditingRoutine}
            className="planner-focus w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const routineId = routineToDelete.id;
              closeRoutineMenu(() => focusVisibleRoutineCard(routineId));
            }}
            className="planner-focus w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => closeRoutineMenu(() => onDeleteRoutineBlock(routineToDelete.id))}
            className="planner-focus w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>,
        document.body
      )}

        {/* Weekly Routine Board */}
        <div className="mt-5 sm:mt-6 lg:mt-8">

          {/* Mobile day selector */}
          <div className="flex snap-x gap-2 overflow-x-auto pb-2 xl:hidden">
            {getWeekDates().map((day) => {
              const isSelected = mobileRoutineDay === day.value;
              const isToday = day.value === new Date().getDay();

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setMobileRoutineDay(day.value)}
                  aria-pressed={isSelected}
                  aria-label={`${day.label}, ${day.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}${isToday ? ", today" : ""}`}
                  className={`planner-focus min-w-20 shrink-0 snap-start rounded-lg border px-3 py-2 text-center transition ${isSelected
                    ? "border-indigo-500 bg-[#eef1ff] text-indigo-700"
                    : "border-[#dce5f4] bg-[#fcfdfe] text-slate-600"
                    }`}
                >
                  <div className="text-xs font-semibold">
                    {day.label.slice(0, 3)}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    {day.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  {isToday && (
                    <div className="mt-0.5 text-[9px] font-semibold uppercase text-blue-600">
                      Today
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden gap-3 xl:grid xl:grid-cols-7">
            {getWeekDates().map((day) => {
              const dayBlocks = routineBlocks
                .filter((block) => block.dayOfWeek === day.value)
                .sort(
                  (a, b) =>
                    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
                );

              const isToday = day.value === new Date().getDay();

              return (
                <div
                  key={day.value}
                  className={`min-h-[180px] rounded-xl border p-3 text-center shadow-sm ${isToday
                    ? "border-indigo-400 bg-[#eef1ff]"
                    : "border-[#dbe4f6] bg-[#f4f7fc]"
                    }`}
                >
                  {/* Day header */}
                  <div
                    className={`mb-3 border-b pb-2 ${isToday ? "border-indigo-200" : "border-[#dce5f4]"
                      }`}
                  >
                    <div
                      className={`text-sm font-bold ${isToday ? "text-indigo-700" : "text-slate-800"
                        }`}
                    >
                      {day.label}
                    </div>

                    <div className="text-xs text-slate-500">
                      {day.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                  </div>

                  {/* Routine blocks */}
                  <div className="space-y-2">
                    {dayBlocks.length > 0 ? (
                      dayBlocks.map((block) => (
                        <div
                          data-routine-card-id={block.id}
                          key={block.id}
                          role={editingRoutineId === block.id ? "group" : "button"}
                          tabIndex={editingRoutineId === block.id ? -1 : 0}
                          aria-haspopup={editingRoutineId === block.id ? undefined : "menu"}
                          aria-controls={editingRoutineId === block.id ? undefined : "routine-actions-menu"}
                          aria-expanded={editingRoutineId === block.id ? undefined : routineToDelete?.id === block.id}
                          aria-label={
                            editingRoutineId === block.id
                              ? `${block.title} is being edited.`
                              : `${block.title}, ${formatTimeRange(block.startTime, block.endTime)}. Open routine actions.`
                          }
                          onClick={(event) => {
                            if (editingRoutineId !== block.id) {
                              openRoutineMenu(event.currentTarget, block);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (
                              editingRoutineId !== block.id &&
                              event.target === event.currentTarget &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              openRoutineMenu(event.currentTarget, block);
                            }
                          }}
                          className={`planner-focus group cursor-pointer rounded-lg border p-2.5 text-center shadow-sm transition ${getRoutineBlockCardStyle(block)} ${
                            editingRoutineId === block.id
                              ? "routine-card-editing relative z-10 scale-[1.03] ring-2 ring-indigo-400 ring-offset-2"
                              : ""
                            }`}
                        >
                          <div
                            className={`text-[10px] font-semibold ${getRoutineBlockTimeStyle(block)}`}
                          >
                            {formatTimeRange(block.startTime, block.endTime)}
                          </div>

                          <div className="mt-1 pr-1 text-sm font-semibold text-slate-800">
                            {renderRoutineTitle(block.title)}
                          </div>

                          {editingRoutineId === block.id && (
                            <div className="mt-1 flex justify-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEditingRoutineId(null);
                                }}
                                className="planner-focus text-[10px] font-bold text-rose-600 underline underline-offset-2 hover:text-rose-700"
                              >
                                Cancel edit
                              </button>
                            </div>
                          )}

                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#dce5f4] bg-[#f8faff] py-5 text-center text-[11px] text-slate-400">
                        No routine blocks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile selected-day routine */}
          <div className="xl:hidden">
            {(() => {
              const selectedDay = getWeekDates().find(
                (day) => day.value === mobileRoutineDay
              );

              const selectedDayBlocks = routineBlocks
                .filter((block) => block.dayOfWeek === mobileRoutineDay)
                .sort(
                  (a, b) =>
                    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
                );

              if (!selectedDay) {
                return null;
              }

              return (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-4">
                    <div className="text-base font-semibold text-slate-800">
                      {selectedDay.label}
                    </div>

                    <div className="text-xs text-slate-400">
                      {selectedDay.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {selectedDayBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayBlocks.map((block) => (
                        <div
                          data-routine-card-id={block.id}
                          key={block.id}
                          role={editingRoutineId === block.id ? "group" : "button"}
                          tabIndex={editingRoutineId === block.id ? -1 : 0}
                          aria-haspopup={editingRoutineId === block.id ? undefined : "menu"}
                          aria-controls={editingRoutineId === block.id ? undefined : "routine-actions-menu"}
                          aria-expanded={editingRoutineId === block.id ? undefined : routineToDelete?.id === block.id}
                          aria-label={
                            editingRoutineId === block.id
                              ? `${block.title} is being edited.`
                              : `${block.title}, ${formatTimeRange(block.startTime, block.endTime)}. Open routine actions.`
                          }
                          onClick={(event) => {
                            if (editingRoutineId !== block.id) {
                              openRoutineMenu(event.currentTarget, block);
                            }
                          }}
                          onKeyDown={(event) => {
                            if (
                              editingRoutineId !== block.id &&
                              event.target === event.currentTarget &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              openRoutineMenu(event.currentTarget, block);
                            }
                          }}
                          className={`planner-focus cursor-pointer rounded-xl border p-3 text-center ${getRoutineBlockCardStyle(block)} ${
                            editingRoutineId === block.id
                              ? "routine-card-editing relative z-10 scale-[1.03] ring-2 ring-indigo-400 ring-offset-2"
                              : ""
                            }`}
                        >
                          <div
                            className={`text-xs font-medium ${getRoutineBlockTimeStyle(block)}`}
                          >
                            {formatTimeRange(block.startTime, block.endTime)}
                          </div>

                          <div className="mt-1 text-sm font-semibold text-slate-800">
                            {renderRoutineTitle(block.title)}
                          </div>

                          {editingRoutineId === block.id && (
                            <div className="mt-1 flex justify-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEditingRoutineId(null);
                                }}
                                className="planner-focus text-[10px] font-bold text-rose-600 underline underline-offset-2 hover:text-rose-700"
                              >
                                Cancel edit
                              </button>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                      No routine blocks for this day.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      </section>

    </div>

  );
}
