import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

import {
  UserProfile,
  AdditionalSubject,
  RoutineBlock,
  RoutineEditRequest
} from "../types";

import {
  CalendarDays,
  Plus,
  X,
  BookOpen,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import TimePicker from "./TimePicker";
import DayPicker from "./DayPicker";
import SubjectPicker, { SubjectPickerOption } from "./SubjectPicker";
import usePlannerPopup from "../hooks/usePlannerPopup";
import useDialogFocus from "../hooks/useDialogFocus";
import { dateInViewedWeek, durationDescription, firstSixRowsHeight, popupOffset, routineDuration } from "../utils/plannerPresentation";

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
import { formatCompactTimeRange, formatTimeRange } from "../utils/time";
import { resolveRoutineChapter, resolveRoutineSubject } from "../utils/routineTasks";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Subject[];
  additionalSubjects?: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
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

interface RoutineChapterPreview {
  block: RoutineBlock;
  subject: Subject;
  chapter: Subject["chapters"][number];
  anchor: Pick<DOMRect, "top" | "right" | "bottom" | "left" | "height">;
  top: number;
  left: number;
  width: number;
  placement: "left" | "right" | "above" | "below";
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
  const [weekAnchorDate, setWeekAnchorDate] = useState(() => toDayStart(new Date()));
  const routineBoardRef = React.useRef<HTMLDivElement>(null);
  const dayTabsRef = React.useRef<HTMLDivElement>(null);
  const formHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const addedBlockRef = React.useRef<Omit<RoutineBlock, "id"> | null>(null);
  const draftNeedsScroll = React.useRef(false);
  const suppressPreviewRef = React.useRef<string | null>(null);
  const menuCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [routineSubjectId, setRoutineSubjectId] = useState<string | null>(null);
  const [routineChapterId, setRoutineChapterId] = useState<string | null>(null);
  const [routineStart, setRoutineStart] = useState("17:00");
  const [routineEnd, setRoutineEnd] = useState("18:00");
  const [endPickerOpenRequest, setEndPickerOpenRequest] = useState(0);
  const [dayPickerOpenRequest, setDayPickerOpenRequest] = useState(0);
  const [subjectPickerOpenRequest, setSubjectPickerOpenRequest] = useState(0);
  const [startPickerOpenRequest, setStartPickerOpenRequest] = useState(0);
  const [routineError, setRoutineError] = useState<string | null>(null);
  const routineErrorRef = React.useRef<HTMLDivElement>(null);
  const routineMenuRef = React.useRef<HTMLDivElement>(null);
  const [routineToDelete, setRoutineToDelete] =
    useState<RoutineBlock | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineToFocus, setRoutineToFocus] = useState<string | null>(null);
  const [isWideRoutineBoard, setIsWideRoutineBoard] = useState(false);
  const [deletedRoutine, setDeletedRoutine] = useState<RoutineBlock | null>(null);
  const deletedRoutineTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileRoutineSheetRef = React.useRef<HTMLDivElement>(null);
  const [routineMenuPosition, setRoutineMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 72,
    maxHeight: 72,
    placement: "right" as FloatingPlacement,
  });
  const [isRoutineMenuClosing, setIsRoutineMenuClosing] = useState(false);
  const [routineChapterPreview, setRoutineChapterPreview] =
    useState<RoutineChapterPreview | null>(null);
  const routinePreviewCloseTimer = React.useRef<number | null>(null);
  const routinePreviewRef = React.useRef<HTMLButtonElement>(null);

  const clearRoutinePreviewCloseTimer = () => {
    if (routinePreviewCloseTimer.current !== null) {
      window.clearTimeout(routinePreviewCloseTimer.current);
      routinePreviewCloseTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRoutinePreviewCloseTimer();
      if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
      if (deletedRoutineTimer.current) clearTimeout(deletedRoutineTimer.current);
    };
  }, []);

  useEffect(() => {
    const board = routineBoardRef.current;
    if (!board) return;
    const updateWidth = () => setIsWideRoutineBoard(board.clientWidth >= 1170);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  // Never leave a floating card detached from its trigger after scrolling.
  useEffect(() => {
    if (!routineChapterPreview) return;
    const dismiss = () => {
      if (routinePreviewRef.current?.contains(document.activeElement)) {
        suppressPreviewRef.current = routineChapterPreview.block.id;
        focusVisibleRoutineCard(routineChapterPreview.block.id);
      }
      setRoutineChapterPreview(null);
    };
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node) || !routinePreviewRef.current?.contains(event.target)) dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        suppressPreviewRef.current = routineChapterPreview.block.id;
        dismiss();
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [routineChapterPreview]);

  React.useLayoutEffect(() => {
    if (!routineChapterPreview || !routinePreviewRef.current) return;

    const preview = {
      width: routinePreviewRef.current.offsetWidth,
      height: routinePreviewRef.current.offsetHeight,
    };
    const { anchor } = routineChapterPreview;
    const gap = 8;
    const padding = 8;
    const leftFits = anchor.left - preview.width - gap >= padding;
    const rightFits = anchor.right + preview.width + gap <= window.innerWidth - padding;
    const placement = leftFits
      ? "left"
      : rightFits
        ? "right"
        : window.innerHeight - anchor.bottom >= anchor.top
          ? "below"
          : "above";
    const top =
      placement === "below"
        ? anchor.bottom + gap
        : placement === "above"
          ? Math.max(padding, anchor.top - preview.height - gap)
          : Math.min(
              Math.max(padding, anchor.top + (anchor.height - preview.height) / 2),
              window.innerHeight - preview.height - padding
            );
    const left =
      placement === "left"
        ? anchor.left - preview.width - gap
        : placement === "right"
          ? anchor.right + gap
          : Math.min(
              Math.max(padding, anchor.left),
              window.innerWidth - preview.width - padding
            );

    setRoutineChapterPreview((current) => {
      if (!current || current.block.id !== routineChapterPreview.block.id) return current;
      if (
        current.placement === placement &&
        Math.abs(current.top - top) < 1 &&
        Math.abs(current.left - left) < 1
      ) {
        return current;
      }

      return { ...current, placement, top, left };
    });
  }, [routineChapterPreview]);

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
    setSubjectPickerOpenRequest((request) => request + 1);

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
    return resolveRoutineSubject(block, subjects);
  };

  const getRoutineBlockChapter = (block: RoutineBlock) => {
    return resolveRoutineChapter(block, subjects);
  };

  const getBalancedRoutinePreviewLines = (chapterName: string) => {
    const normalizedName = chapterName.trim().replace(/\s+/g, " ");
    const colonIndex = normalizedName.indexOf(":");

    // A colon already gives the title a meaningful natural break.
    if (colonIndex >= 0 && colonIndex < normalizedName.length - 1) {
      return [
        normalizedName.slice(0, colonIndex + 1).trim(),
        normalizedName.slice(colonIndex + 1).trim(),
      ];
    }

    const words = normalizedName.split(" ").filter(Boolean);
    if (words.length <= 5) return [normalizedName];

    // Choose the word boundary whose two lines have the closest character length.
    let bestBreakIndex = 1;
    let smallestDifference = Number.POSITIVE_INFINITY;

    for (let index = 1; index < words.length; index += 1) {
      const firstLineLength = words.slice(0, index).join(" ").length;
      const secondLineLength = words.slice(index).join(" ").length;
      const difference = Math.abs(firstLineLength - secondLineLength);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        bestBreakIndex = index;
      }
    }

    return [
      words.slice(0, bestBreakIndex).join(" "),
      words.slice(bestBreakIndex).join(" "),
    ];
  };

  // A stable popover footprint stops the weekly board from feeling uneven as
  // students move across routines with short and long chapter titles.
  const getRoutinePreviewWidth = () => Math.min(220, window.innerWidth - 16);

  const getRoutinePreviewPosition = (card: DOMRect, width: number) => {
    const height = 100;
    const gap = 8;
    const padding = 8;
    const leftSpace = card.left - gap - padding;
    const rightSpace = window.innerWidth - card.right - gap - padding;
    const placement =
      leftSpace >= width
        ? "left"
        : rightSpace >= width
          ? "right"
          : window.innerHeight - card.bottom >= card.top
            ? "below"
            : "above";
    const top =
      placement === "below"
        ? card.bottom + gap
        : placement === "above"
          ? Math.max(padding, card.top - height - gap)
          : Math.min(
              Math.max(padding, card.top + (card.height - height) / 2),
              window.innerHeight - height - padding
            );
    const left =
      placement === "left"
        ? card.left - width - gap
        : placement === "right"
          ? card.right + gap
          : Math.min(Math.max(padding, card.left), window.innerWidth - width - padding);

    return { top, left, width, placement } as const;
  };

  const showRoutineChapterPreview = (
    cardElement: HTMLDivElement,
    block: RoutineBlock
  ) => {
    if (editingRoutineId || routineToDelete || expandedSubjectId || showRoutineForm ||
        suppressPreviewRef.current === block.id || !window.matchMedia("(hover: hover)").matches) return;

    const chapterDetails = getRoutineBlockChapter(block);
    if (!chapterDetails) {
      setRoutineChapterPreview(null);
      return;
    }

    clearRoutinePreviewCloseTimer();
    const card = cardElement.getBoundingClientRect();
    const previewWidth = getRoutinePreviewWidth();
    setRoutineChapterPreview({
      block,
      ...chapterDetails,
      anchor: {
        top: card.top,
        right: card.right,
        bottom: card.bottom,
        left: card.left,
        height: card.height,
      },
      ...getRoutinePreviewPosition(card, previewWidth),
    });
  };

  const scheduleRoutineChapterPreviewClose = () => {
    clearRoutinePreviewCloseTimer();
    routinePreviewCloseTimer.current = window.setTimeout(() => {
      setRoutineChapterPreview(null);
      routinePreviewCloseTimer.current = null;
    }, shouldReduceMotion ? 0 : 110);
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

  const toggleRoutineForm = () => {
    const nextOpenState = !showRoutineForm;
    claimChapterPopup();
    setExpandedSubjectId(null);
    setRoutineChapterPreview(null);

    setRoutineError(null);
    setEndPickerOpenRequest(0);

    if (nextOpenState) {
      setEditingRoutineId(null);
      const today = toDayStart(new Date());
      setRoutineDay(String(today.getDay()));
      setWeekAnchorDate(today);
      setMobileRoutineDay(today.getDay());
      setDayPickerOpenRequest((request) => request + 1);
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
      chapterId: routineChapterId ?? undefined,
      startTime: routineStart,
      endTime: routineEnd,
      color,
    };

    addedBlockRef.current = updatedRoutine;
    setMobileRoutineDay(dayOfWeek);
    setWeekAnchorDate(dateInViewedWeek(weekAnchorDate, dayOfWeek));
    onAddRoutineBlock(updatedRoutine);

    setRoutineTitle("");
    setRoutineSubjectId(null);
    setRoutineChapterId(null);
    setEndPickerOpenRequest(0);
    setShowRoutineForm(false);
  };

  const focusVisibleRoutineCard = (routineId: string) => {
    const routineCard = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-routine-card-id="${routineId}"]`
      )
    ).find((card) => card.offsetParent !== null);

    routineCard?.focus({ preventScroll: true });
  };

  const closeRoutineMenu = (afterClose?: () => void) => {
    if (!routineToDelete) return;
    setRoutineToDelete(null);
    afterClose?.();
  };

  const openRoutineMenu = (
    cardElement: HTMLDivElement,
    block: RoutineBlock
  ) => {
    if (editingRoutineId === block.id) return;
    if (routineToDelete?.id === block.id) {
      setRoutineToDelete(null);
      return;
    }
    claimRoutinePopup();
    setExpandedSubjectId(null);
    setRoutineChapterPreview(null);
    clearRoutinePreviewCloseTimer();
    menuAnchorRef.current = cardElement;
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

  const startEditingRoutine = () => {
    if (!routineToDelete) return;

    const block = routineToDelete;
    closeRoutineMenu(() => {
      setShowRoutineForm(false);
      setRoutineError(null);
      setRoutineTitle("");
      setRoutineSubjectId(null);
      setRoutineChapterId(null);
      setEndPickerOpenRequest(0);
      setRoutineChapterPreview(null);
      setEditingRoutineId(block.id);
      setRoutineToFocus(block.id);
    });
  };

  const deleteRoutineWithUndo = () => {
    if (!routineToDelete) return;
    const block = routineToDelete;
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
    const block = routineBlocks.find((item) => item.id === editRoutineRequest.routineId);
    if (block) {
      const [year, month, day] = editRoutineRequest.occurrenceDate.split("-").map(Number);
      setWeekAnchorDate(new Date(year, month - 1, day));
      setShowRoutineForm(false);
      setRoutineError(null);
      setRoutineTitle("");
      setRoutineSubjectId(null);
      setRoutineChapterId(null);
      setEndPickerOpenRequest(0);
      setRoutineToDelete(null);
      setRoutineChapterPreview(null);
      setExpandedSubjectId(null);
      setMobileRoutineDay(block.dayOfWeek);
      setEditingRoutineId(block.id);
      setRoutineToFocus(block.id);
    }
    onEditRequestHandled?.();
  }, [editRoutineRequest, routineBlocks, onEditRequestHandled]);

  useEffect(() => {
    if (!routineToFocus) return;
    // Wait for the selected mobile day and edit highlight to render.
    const frame = window.requestAnimationFrame(() => {
      const card = Array.from(document.querySelectorAll<HTMLElement>("[data-routine-card-id]"))
        .find((element) => element.dataset.routineCardId === routineToFocus && element.offsetParent !== null);
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "center" });
      setRoutineToFocus(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routineToFocus, mobileRoutineDay, shouldReduceMotion]);

  const renderRoutineTitle = (title: string) => {
    const colonIndex = title.indexOf(":");

    if (colonIndex === -1) {
      return <span className="break-words [overflow-wrap:anywhere]">{title}</span>;
    }

    const subjectPart = title.slice(0, colonIndex + 1);
    const chapterPart = title.slice(colonIndex + 1).trimStart();

    return (
      <span className="flex w-full flex-wrap justify-center gap-x-1 gap-y-0 leading-tight">
        <span className="break-words [overflow-wrap:anywhere]">{subjectPart}</span>
        <span className="break-words [overflow-wrap:anywhere]">{chapterPart}</span>
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
  const visibleWeek = getWeekDates(weekAnchorDate);


  // ------------------------------------------------------------
  // Subjects & Chapters
  // ------------------------------------------------------------

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [chapterTrigger, setChapterTrigger] = useState<HTMLButtonElement | null>(
    null
  );
  const chapterPopoverRef = React.useRef<HTMLDivElement>(null);
  const [chapterListHeight, setChapterListHeight] = useState(280);
  const claimChapterPopup = usePlannerPopup(() => {
    setExpandedSubjectId(null);
    setChapterTrigger(null);
  });
  const claimRoutinePopup = usePlannerPopup(() => {
    clearRoutinePreviewCloseTimer();
    setRoutineChapterPreview(null);
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setRoutineToDelete(null);
    setIsRoutineMenuClosing(false);
  });
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

      if (!target.closest(".chapter-popover") && !target.closest("[data-subject-card]")) {
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
      const rows = Array.from(chapterPopoverRef.current?.querySelectorAll<HTMLElement>("[data-chapter-option]") ?? []);
      if (rows.length) setChapterListHeight(firstSixRowsHeight(rows.map(row => row.getBoundingClientRect().height), 4, 20));
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

      (firstChapter ?? chapterPopoverRef.current)?.focus({ preventScroll: true });
    });
    const observer = new ResizeObserver(updateChapterPosition);
    if (chapterPopoverRef.current) observer.observe(chapterPopoverRef.current);
    let alive = true;
    document.fonts.ready.then(() => { if (alive) updateChapterPosition(); });
    window.addEventListener("resize", updateChapterPosition);
    window.addEventListener("scroll", updateChapterPosition, true);

    return () => {
      alive = false;
      observer.disconnect();
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

  const formatFullChapterLabel = (chapterNumber: string) => {
    const trimmed = chapterNumber.trim();

    if (/^chapter\s+/i.test(trimmed)) {
      return trimmed.replace(/^chapter\s+/i, "Chapter-");
    }

    if (/^lesson\s+/i.test(trimmed)) {
      return trimmed.replace(/^lesson\s+/i, "Lesson-");
    }

    if (/^question\s+/i.test(trimmed)) {
      return trimmed.replace(/^question\s+/i, "Question-");
    }

    if (/^ch[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^ch[-\s]?/i, "Chapter-");
    }

    if (/^less[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^less[-\s]?/i, "Lesson-");
    }

    if (/^ques[-\s]?/i.test(trimmed)) {
      return trimmed.replace(/^ques[-\s]?/i, "Question-");
    }

    return `Chapter-${trimmed}`;
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

    claimChapterPopup();
    setRoutineChapterPreview(null);
    setChapterListHeight(280);
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
    ? `subject:${routineSubjectId}`
    : safeAdditionalSubjects.find(
        (subject) => formatRoutineSubjectName(subject.name) === routineTitle
      )
      ? `additional:${
          safeAdditionalSubjects.find(
            (subject) => formatRoutineSubjectName(subject.name) === routineTitle
          )!.id
        }`
      : "";

  const handleRoutineSubjectSelect = (option: SubjectPickerOption) => {
    const [kind, id] = option.key.split(":");

    setRoutineTitle(formatRoutineSubjectName(option.label));
    setRoutineChapterId(null);

    if (kind === "subject") {
      setRoutineSubjectId(id);
    } else {
      setRoutineSubjectId(null);
    }

    setStartPickerOpenRequest((request) => request + 1);
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
      routineCard?.focus({ preventScroll: true });
    }, 0);
  };

  const replaceRoutineSubject = (
    routineId: string,
    title: string,
    subjectId: string | undefined,
    chapterId: string | undefined,
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
      chapterId,
      startTime: routineBeingEdited.startTime,
      endTime: routineBeingEdited.endTime,
      color: color ?? routineBeingEdited.color,
    });

    setEditingRoutineId(null);
    setExpandedSubjectId(null);
    scrollRoutineCardIntoView(routineId);
  };

  const prepareDraft = () => {
    if (showRoutineForm) return;
    draftNeedsScroll.current = true;
    const today = toDayStart(new Date());
    setRoutineDay(String(today.getDay()));
    setWeekAnchorDate(today);
    setMobileRoutineDay(today.getDay());
    setRoutineError(null);
    setShowRoutineForm(true);
  };

  const handleChapterSelect = (
    subjectId: string,
    subjectName: string,
    chapterNumber: string,
    chapterId: string
  ) => {
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
        chapterId,
        getRoutineColorForSubject(selectedSubject?.color ?? "") ?? undefined
      );
      return;
    }

    prepareDraft();
    setRoutineTitle(title);
    setRoutineSubjectId(subjectId);
    setRoutineChapterId(chapterId);
    setExpandedSubjectId(null);
  };

  const handleAdditionalSubjectSelect = (subjectName: string) => {
    const title = formatRoutineSubjectName(subjectName);

    if (editingRoutineId) {
      replaceRoutineSubject(editingRoutineId, title, undefined, undefined, "amber");
      return;
    }

    prepareDraft();
    setRoutineTitle(title);
    setRoutineSubjectId(null);
    setRoutineChapterId(null);
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
        {createPortal(
          <AnimatePresence initial={false}>{isExpanded && <motion.div
            key={subject.id}
            initial={shouldReduceMotion ? false : { opacity: 0, ...popupOffset(chapterPopoverPosition.placement) }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...popupOffset(chapterPopoverPosition.placement), pointerEvents: "none" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            data-subject-id={subject.id}
            ref={(node) => {
              if (node) chapterPopoverRef.current = node;
              else if (chapterPopoverRef.current?.dataset.subjectId === subject.id) chapterPopoverRef.current = null;
            }}
            id={`chapter-picker-${subject.id}`}
            role="dialog"
            aria-label={`Choose a chapter from ${subject.name}`}
            tabIndex={-1}
            onKeyDown={handleChapterPopoverKeyDown}
            className="chapter-popover planner-popup fixed z-[110] flex flex-col overflow-hidden rounded-xl border bg-white"
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
                <div className="text-xs font-medium text-slate-500">
                  {editingRoutineId ? "Choose replacement chapter" : "Choose a chapter for your routine"}
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
              <div style={{ maxHeight: chapterListHeight }} className="chapter-popover-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pb-3 pl-3 pr-1 pt-2">
                {subject.chapters.map((chapter) => (
                  <button
                    type="button"
                    key={chapter.id}
                    data-chapter-option
                    onClick={() =>
                      handleChapterSelect(
                        subject.id,
                        subject.name,
                        chapter.chapterNumber,
                        chapter.id
                      )
                    }
                    className={`planner-focus flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[13px] transition-colors cursor-pointer ${styles.chapter}`}
                  >
                    <span className={`shrink-0 rounded-md px-1.5 py-1 text-[10px] font-bold ${styles.icon}`}>
                      {formatChapterNumber(chapter.chapterNumber)}
                    </span>{" "}
                    <span className="min-w-0 flex-1 font-medium">{chapter.banglaName}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-xs text-slate-500">
                No chapter data is available for this subject yet.
              </div>
            )}
          </motion.div>}</AnimatePresence>,
          document.body
        )}

        <button
          type="button"
          onClick={(event) => toggleSubject(subject.id, event)}
          data-subject-card
          aria-haspopup="dialog"
          aria-expanded={isExpanded}
          aria-controls={`chapter-picker-${subject.id}`}
          style={{ ["--subject-hover-color" as string]: subjectAccent }}
          className={`planner-focus subject-card-live w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm cursor-pointer ${styles.card}`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`subject-card-live-icon rounded-lg p-1.5 shrink-0 ${styles.icon}`}>
              <BookOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-800 break-words">
                {subject.name}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
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
      style={{ ["--subject-hover-color" as string]: "#d97706" }}
      className={`planner-focus subject-card-live w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm cursor-pointer ${additionalSubjectStyles.card}`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`subject-card-live-icon rounded-lg p-1.5 shrink-0 ${additionalSubjectStyles.icon}`}>
          <BookOpen className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-slate-800 break-words">
            {subject.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Additional subject
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div
      className="planner-shell"
      id="study-planner-container"
    >
      {/* ------------------------------------------------------ */}
      {/* Weekly Routine */}
      {/* ------------------------------------------------------ */}

      <section className="planner-surface">
        <div className="flex flex-col gap-3 border-b border-[#dce5f4] pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#edf3ff] text-indigo-600 rounded-xl">
              <CalendarDays className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                Weekly Routine
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Repeats every week. Changing a chapter keeps its saved day and time.
              </p>
            </div>
          </div>

          <button
            ref={addButtonRef}
            type="button"
            onClick={toggleRoutineForm}
            aria-expanded={showRoutineForm}
            aria-controls="routine-add-form"
            className={`planner-focus planner-form-toggle ${showRoutineForm ? "planner-secondary" : "planner-primary"}`}
          >
            {showRoutineForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showRoutineForm ? "Close" : "Add Routine Block"}</span>
          </button>
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
                height: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] },
                marginTop: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: shouldReduceMotion ? 0 : 0.18, ease: "linear" },
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
                Add an activity to your schedule
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
                  setSubjectPickerOpenRequest((request) => request + 1);
                }}
                days={DAYS}
                selectedDate={weekAnchorDate}
                onDateSelect={handleRoutineDateSelect}
                openDaysRequest={dayPickerOpenRequest}
              />

              {/* Subject */}
              <SubjectPicker
                value={selectedRoutineSubjectKey}
                options={routineSubjectOptions}
                onChange={handleRoutineSubjectSelect}
                openRequest={subjectPickerOpenRequest}
                onOpenRequestHandled={() => setSubjectPickerOpenRequest(0)}
              />

              {/* Start */}
              <TimePicker
                value={routineStart}
                onChange={setRoutineStart}
                label="Start"
                onPeriodChange={handleStartPeriodChange}
                closeOnPeriodChange
                openRequest={startPickerOpenRequest}
                onOpenRequestHandled={() => setStartPickerOpenRequest(0)}
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

            <div className="planner-form-context" aria-live="polite">
              <span>Repeats every {getDayName(Number(routineDay))} · not a one-time booking</span>
              <span>{durationDescription(routineStart, routineEnd)}</span>
            </div>

            {/* Submit */}
            <div className="grid min-h-11 grid-cols-1 items-center md:grid-cols-[auto_minmax(0,1fr)] md:gap-3">
              <button
                type="button"
                onClick={handleAddRoutine}
                className="planner-focus planner-primary flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors md:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add to Weekly Routine
              </button>

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
            const details = getRoutineBlockChapter(routineToDelete);
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
                <div className="mt-1 text-base font-semibold text-slate-800">{renderRoutineTitle(routineToDelete.title)}</div>
              </div>
              {details && (
                <button type="button" lang="bn" className="planner-focus routine-sheet-chapter mt-4 w-full rounded-xl px-3 py-3 text-center font-semibold text-slate-800"
                  onClick={() => { closeRoutineMenu(); onOpenRoutineChapter(details.subject.id, details.chapter.id); }}>
                  {details.chapter.banglaName}
                </button>
              )}
              <div className={`${details ? "mt-2" : "mt-3"} grid grid-cols-2 gap-2 border-t border-slate-100 pt-3`}>
                <button type="button" onClick={startEditingRoutine} className="planner-focus routine-sheet-action">Edit</button>
                <button type="button" onClick={deleteRoutineWithUndo} className="planner-focus routine-sheet-action routine-card-delete">Delete</button>
              </div>
              <button type="button" onClick={() => closeRoutineMenu()} className="planner-focus mt-3 w-full rounded-lg py-2 text-sm font-medium text-slate-500">Close</button>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

        {/* Weekly Routine Board */}
        <div id="planner-week-board" ref={routineBoardRef} tabIndex={-1} className="planner-board">
          <div className="planner-board-heading">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Weekly routine</h3>
              <p className="text-xs leading-relaxed text-slate-600">Week of {visibleWeek[0].date.toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})} · current repeating plan, not a history log</p>
            </div>
            <button type="button" className="planner-focus planner-text-action" onClick={() => {
              const today = toDayStart(new Date()); setWeekAnchorDate(today); setMobileRoutineDay(today.getDay());
            }}>This week</button>
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

                  <div className={`text-xs ${isToday ? "font-semibold text-sky-700" : "text-slate-500"}`}>
                    {isToday ? "Today" : day.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="planner-week-grid">
            {visibleWeek.map((day) => {
              const dayBlocks = routineBlocks
                .filter((block) => block.dayOfWeek === day.value)
                .sort(
                  (a, b) =>
                    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
                );

              const isToday = isSameCalendarDate(day.date, new Date());
              const isSelectedDate = isSameCalendarDate(day.date, weekAnchorDate);

              return (
                <div
                  key={day.value}
                  className={`planner-day-column min-h-[180px] rounded-xl border p-2.5 text-center ${isSelectedDate
                    ? "border-indigo-300 bg-[#f5f6ff]"
                    : isToday
                    ? "border-sky-300 bg-sky-50/60"
                    : "border-[#dbe4f6] bg-[#f4f7fc]"
                    }`}
                >
                  {/* Day header */}
                  <div
                    className={`mb-3 border-b pb-2 ${isSelectedDate ? "border-indigo-200" : isToday ? "border-sky-200" : "border-[#dce5f4]"
                      }`}
                  >
                    <div
                      className={`text-sm font-bold ${isSelectedDate ? "text-indigo-700" : isToday ? "text-sky-700" : "text-slate-800"
                        }`}
                    >
                      {day.label}
                    </div>

                    <div className={`text-xs ${isToday ? "font-semibold text-sky-700" : "text-slate-500"}`}>
                      {isToday ? "Today" : day.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                  </div>
                  {/* Routine blocks */}
                  <div className="space-y-2">
                    {dayBlocks.length > 0 ? (
                      dayBlocks.map((block) => {
                        const details = getRoutineBlockChapter(block);
                        const isOpen = routineToDelete?.id === block.id;
                        const isEditing = editingRoutineId === block.id;
                        return <motion.div
                                    layout
                          data-routine-card-id={block.id}
                          key={block.id}
                          transition={{ layout: { duration: shouldReduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] } }}
                          className={`routine-card group relative overflow-hidden rounded-lg border text-center shadow-sm ${getRoutineBlockCardStyle(block)} ${
                            isEditing
                              ? "routine-card-editing relative z-10 ring-2 ring-indigo-300 ring-offset-2"
                              : ""
                            }`}
                        >
                          <button
                            type="button"
                            disabled={isEditing}
                            aria-expanded={isOpen}
                            aria-controls={isOpen ? `routine-details-${block.id}` : undefined}
                            aria-label={`${block.title}, ${formatTimeRange(block.startTime, block.endTime)}. ${isOpen ? "Close details" : "Open details"}.`}
                            onClick={(event) => openRoutineMenu(event.currentTarget.parentElement as HTMLDivElement, block)}
                            className="planner-focus routine-card-trigger relative flex w-full flex-col items-center justify-center px-2.5 py-2.5 text-center disabled:cursor-default"
                          >
                            <span className={`whitespace-nowrap text-[11px] font-semibold tabular-nums ${getRoutineBlockTimeStyle(block)}`}>
                              {formatCompactTimeRange(block.startTime, block.endTime)}
                            </span>
                            <span className="routine-card-title mt-1 min-w-0 text-[13px] font-semibold text-slate-800">{renderRoutineTitle(block.title)}</span>
                            <MoreHorizontal aria-hidden="true" className="routine-card-more absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                id={`routine-details-${block.id}`}
                                data-routine-details
                                initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                                className="routine-card-details overflow-hidden"
                              >
                                <div className="routine-card-details-inner">
                                  {details && (
                                    <button type="button" lang="bn" className="planner-focus routine-card-chapter"
                                      aria-label={`Open ${details.chapter.banglaName}`}
                                      onClick={() => onOpenRoutineChapter(details.subject.id, details.chapter.id)}>
                                      {details.chapter.banglaName}
                                    </button>
                                  )}
                                  <div className="routine-card-actions">
                                    <button type="button" onClick={startEditingRoutine} className="planner-focus routine-card-action">Edit</button>
                                    <button type="button" onClick={deleteRoutineWithUndo} className="planner-focus routine-card-action routine-card-delete">Delete</button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {isEditing && (
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

                        </motion.div>;
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#dce5f4] bg-[#f8faff] py-5 text-center text-xs text-slate-500">
                        No sessions
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile selected-day routine */}
          <div className="planner-selected-day">
            {(() => {
              const selectedDay = visibleWeek.find(
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
                      {selectedDayBlocks.map((block) => {
                        const editing = editingRoutineId === block.id;
                        return (
                          <div key={block.id} data-routine-card-id={block.id}
                            role="group" tabIndex={-1}
                            aria-label={editing ? `${block.title} is being edited.` : block.title}
                            className={`planner-focus rounded-xl border p-3 text-center ${getRoutineBlockCardStyle(block)} ${editing ? "routine-card-editing ring-2 ring-indigo-300 ring-offset-2" : ""}`}>
                            <button type="button" disabled={editing}
                              aria-haspopup="dialog" aria-expanded={routineToDelete?.id === block.id}
                              aria-label={`${block.title}, ${formatTimeRange(block.startTime, block.endTime)}. Open details.`}
                              onClick={(event) => openRoutineMenu(event.currentTarget.parentElement as HTMLDivElement, block)}
                              className="planner-focus block w-full cursor-pointer rounded-lg p-1 disabled:cursor-default">
                              <span className={`block whitespace-nowrap text-xs font-medium tabular-nums ${getRoutineBlockTimeStyle(block)}`}>
                                {formatCompactTimeRange(block.startTime, block.endTime)}
                              </span>
                              <span className="relative mt-1 block text-[13px] font-semibold text-slate-800">{renderRoutineTitle(block.title)}<MoreHorizontal aria-hidden="true" className="absolute right-0 top-0 h-3.5 w-3.5 text-slate-400" /></span>
                            </button>
                            {editing && <button type="button" onClick={() => {
                              setEditingRoutineId(null);
                              requestAnimationFrame(() => focusVisibleRoutineCard(block.id));
                            }} className="planner-focus mt-2 rounded px-2 py-1 text-xs font-semibold text-rose-600 underline underline-offset-2">Cancel edit</button>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                      No sessions for this day.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {createPortal(
        <AnimatePresence>
          {deletedRoutine && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="routine-undo fixed bottom-5 left-1/2 z-[130] flex w-[min(360px,calc(100vw-32px))] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
            >
              <span className="min-w-0 text-sm font-medium text-slate-700">Routine deleted.</span>
              <button type="button" onClick={undoRoutineDelete} className="planner-focus shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Undo</button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>

  );
}
