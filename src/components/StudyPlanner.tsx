import React, { useEffect, useState } from "react";

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

import { Subject } from "../data/curriculum";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Subject[];
  additionalSubjects?: AdditionalSubject[];
  routineBlocks: RoutineBlock[];
  onAddRoutineBlock: (
    newBlock: Omit<RoutineBlock, "id">
  ) => void;
  onDeleteRoutineBlock: (id: string) => void;
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
  onBackToDashboard
}: StudyPlannerProps) {
  // ------------------------------------------------------------
  // Weekly Routine
  // ------------------------------------------------------------

  const [routineDay, setRoutineDay] = useState("6");
  const [mobileRoutineDay, setMobileRoutineDay] = useState(
    new Date().getDay()
  );
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineStart, setRoutineStart] = useState("17:00");
  const [routineEnd, setRoutineEnd] = useState("18:00");
  const [routineError, setRoutineError] = useState<string | null>(null);
  const [routineToDelete, setRoutineToDelete] =
    useState<RoutineBlock | null>(null);

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

  const getRoutineColorForSubject = (subjectColor: string) => {
    const color = subjectColor.toLowerCase();

    if (color.includes("emerald")) return "green";
    if (color.includes("blue")) return "blue";
    if (color.includes("purple") || color.includes("violet")) return "purple";
    if (color.includes("cyan")) return "cyan";
    if (color.includes("amber") || color.includes("orange")) return "amber";
    if (color.includes("teal")) return "teal";
    if (color.includes("fuchsia") || color.includes("pink")) return "pink";
    if (color.includes("rose")) return "rose";
    if (color.includes("yellow")) return "yellow";

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

  const handleAddRoutine = () => {
    setRoutineError(null);

    const title = routineTitle.trim();

    if (!title) {
      setRoutineError("Please enter an activity.");
      return;
    }

    if (
      !routineStart ||
      !routineEnd ||
      timeToMinutes(routineEnd) <= timeToMinutes(routineStart)
    ) {
      setRoutineError(
        "End time must be later than start time."
      );
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
    const newStart = timeToMinutes(routineStart);
    const newEnd = timeToMinutes(routineEnd);

    const hasOverlap = routineBlocks.some((block) => {
      if (block.dayOfWeek !== dayOfWeek) {
        return false;
      }

      const existingStart = timeToMinutes(block.startTime);
      const existingEnd = timeToMinutes(block.endTime);

      return (
        newStart < existingEnd &&
        newEnd > existingStart
      );
    });

    if (hasOverlap) {
      setRoutineError(
        "This time overlaps with another routine block. Please choose a different time."
      );
      return;
    }

    onAddRoutineBlock({
      dayOfWeek,
      title,
      startTime: routineStart,
      endTime: routineEnd,
      color,
    });

    setRoutineTitle("");
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".chapter-popover")) {
        setExpandedSubjectId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const safeAdditionalSubjects = additionalSubjects ?? [];

  const getSubjectCardStyles = (color: string) => {
    if (color.includes("emerald")) {
      return {
        card: "bg-emerald-50/45 border-emerald-100/70 hover:border-emerald-200",
        chapter: "bg-emerald-50/40 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-emerald-100/60",
        icon: "bg-emerald-100 text-emerald-600",
      };
    }

    if (color.includes("blue")) {
      return {
        card: "bg-blue-50/45 border-blue-100/70 hover:border-blue-200",
        chapter: "bg-blue-50/40 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-blue-100/60",
        icon: "bg-blue-100 text-blue-600",
      };
    }

    if (color.includes("purple") || color.includes("violet")) {
      return {
        card: "bg-purple-50/45 border-purple-100/70 hover:border-purple-200",
        chapter: "bg-purple-50/40 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-purple-100/60",
        icon: "bg-purple-100 text-purple-600",
      };
    }

    if (color.includes("cyan")) {
      return {
        card: "bg-cyan-50/45 border-cyan-100/70 hover:border-cyan-200",
        chapter: "bg-cyan-50/40 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border-cyan-100/60",
        icon: "bg-cyan-100 text-cyan-600",
      };
    }

    if (color.includes("amber") || color.includes("orange")) {
      return {
        card: "bg-amber-50/45 border-amber-100/70 hover:border-amber-200",
        chapter: "bg-amber-50/40 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-amber-100/60",
        icon: "bg-amber-100 text-amber-600",
      };
    }

    if (color.includes("teal")) {
      return {
        card: "bg-teal-50/45 border-teal-100/70 hover:border-teal-200",
        chapter: "bg-teal-50/40 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border-teal-100/60",
        icon: "bg-teal-100 text-teal-600",
      };
    }

    if (color.includes("fuchsia") || color.includes("pink")) {
      return {
        card: "bg-pink-50/45 border-pink-100/70 hover:border-pink-200",
        chapter: "bg-pink-50/40 hover:bg-pink-50 text-slate-600 hover:text-pink-700 border-pink-100/60",
        icon: "bg-pink-100 text-pink-600",
      };
    }

    if (color.includes("rose")) {
      return {
        card: "bg-rose-50/45 border-rose-100/70 hover:border-rose-200",
        chapter: "bg-rose-50/40 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-rose-100/60",
        icon: "bg-rose-100 text-rose-600",
      };
    }

    return {
      card: "bg-slate-50/60 border-slate-200/70 hover:border-slate-300",
      chapter: "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 border-slate-200",
      icon: "bg-slate-100 text-slate-600",
    };
  };

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

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjectId((current) =>
      current === subjectId ? null : subjectId
    );
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

  const handleChapterSelect = (
    subjectName: string,
    chapterNumber: string
  ) => {
    if (!showRoutineForm) {
      return;
    }

    setRoutineTitle(
      `${formatRoutineSubjectName(subjectName)}: ${formatChapterNumber(chapterNumber)}`
    );
    setExpandedSubjectId(null);
  };

  const handleAdditionalSubjectSelect = (subjectName: string) => {
    if (!showRoutineForm) {
      return;
    }

    setRoutineTitle(formatRoutineSubjectName(subjectName));
    setExpandedSubjectId(null);
  };

  const renderSubjectCard = (
    subject: Subject,
    cardIndex: number
  ) => {
    const isExpanded = expandedSubjectId === subject.id;
    const styles = getSubjectCardStyles(subject.color);

    return (
      <div
        key={`${subject.id}-${cardIndex}`}
        className="relative min-w-0"
      >
        {isExpanded && (
          <div className="chapter-popover absolute bottom-full left-0 right-0 z-30 mb-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            {subject.chapters.length > 0 ? (
              <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1">
                {subject.chapters.map((chapter) => (
                  <button
                    type="button"
                    key={chapter.id}
                    onClick={() =>
                      handleChapterSelect(
                        subject.name,
                        chapter.chapterNumber
                      )
                    }
                    className={`w-full rounded-lg border px-2.5 py-2 text-left text-[11px] transition cursor-pointer ${styles.chapter}`}
                  >
                    <span className="font-semibold">
                      {formatChapterNumber(chapter.chapterNumber)}:
                    </span>{" "}
                    <span>{chapter.banglaName}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2.5 py-3 text-[11px] text-slate-400">
                No chapter data is available for this subject yet.
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleSubject(subject.id)}
          aria-expanded={isExpanded}
          className={`w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm transition-all cursor-pointer ${styles.card}`}
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
      className={`w-full min-h-[68px] rounded-xl border p-2.5 text-left shadow-sm transition-all cursor-pointer ${additionalSubjectStyles.card}`}
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
      className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-8"
      id="study-planner-container"
    >
      {/* ------------------------------------------------------ */}
      {/* Weekly Routine */}
      {/* ------------------------------------------------------ */}

      <section className="space-y-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-indigo-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarDays className="w-6 h-6" />
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

          <button
            type="button"
            onClick={() => setShowRoutineForm((prev) => !prev)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            {showRoutineForm ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {showRoutineForm ? "Close" : "Add Routine Block"}
          </button>
        </div>

        {showRoutineForm && (
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700">
                  Add Routine
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Add a recurring activity to your weekly schedule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.15fr_1.6fr_1.15fr_1.15fr]">

              {/* Day */}
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3">
                <span className="text-sm font-semibold text-slate-600">
                  Day
                </span>

                <span className="mx-3 h-5 w-px bg-slate-200" />

                <CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />

                <span className="mx-3 h-5 w-px bg-slate-200" />

                <select
                  value={routineDay}
                  onChange={(e) => setRoutineDay(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

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
                  onChange={(e) => setRoutineTitle(e.target.value)}
                  placeholder="e.g. Chemistry"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Start */}
              <TimePicker
                value={routineStart}
                onChange={setRoutineStart}
                label="Start"
              />

              {/* End */}
              <TimePicker
                value={routineEnd}
                onChange={setRoutineEnd}
                label="End"
              />

            </div>

            {/* Validation error */}
            {routineError && (
              <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />

                <span>{routineError}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleAddRoutine}
                className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Weekly Routine
              </button>
            </div>
          </div>
        )}

        {/* Weekly Routine Board */}
        <div className="mt-8">

          {/* Mobile day selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {getWeekDates().map((day) => {
              const isSelected = mobileRoutineDay === day.value;
              const isToday = day.value === new Date().getDay();

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setMobileRoutineDay(day.value)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-center transition ${isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600"
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

          <div className="hidden gap-3 lg:grid lg:grid-cols-7">
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
                    ? "border-indigo-400 bg-indigo-100"
                    : "border-indigo-200 bg-indigo-50"
                    }`}
                >
                  {/* Day header */}
                  <div
                    className={`mb-3 border-b pb-2 ${isToday ? "border-indigo-200" : "border-slate-200"
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
                          key={block.id}
                          onClick={() => setRoutineToDelete(block)}
                          className={`group cursor-pointer rounded-lg border p-2.5 text-center shadow-sm transition ${ROUTINE_COLOR_STYLES[block.color as keyof typeof ROUTINE_COLOR_STYLES]?.card ??
                            "bg-slate-50 border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                          <div
                            className={`text-[10px] font-semibold ${ROUTINE_COLOR_STYLES[
                              block.color as keyof typeof ROUTINE_COLOR_STYLES
                            ]?.time ?? "text-slate-600"
                              }`}
                          >
                            {block.startTime} – {block.endTime}
                          </div>

                          <div className="mt-1 pr-1 text-sm font-semibold text-slate-800">
                            {renderRoutineTitle(block.title)}
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 py-5 text-center text-[11px] text-slate-400">
                        No routine blocks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile selected-day routine */}
          <div className="lg:hidden">
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
                          key={block.id}
                          onClick={() => setRoutineToDelete(block)}
                          className={`cursor-pointer rounded-xl border p-3 text-center ${ROUTINE_COLOR_STYLES[
                            block.color as keyof typeof ROUTINE_COLOR_STYLES
                          ]?.card ?? "bg-slate-50 border-slate-200"
                            }`}
                        >
                          <div
                            className={`text-xs font-medium ${ROUTINE_COLOR_STYLES[
                              block.color as keyof typeof ROUTINE_COLOR_STYLES
                            ]?.time ?? "text-slate-500"
                              }`}
                          >
                            {block.startTime} – {block.endTime}
                          </div>

                          <div className="mt-1 text-sm font-semibold text-slate-800">
                            {renderRoutineTitle(block.title)}
                          </div>

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


      {/* ------------------------------------------------------ */}
      {/* Subjects & Chapters */}
      {/* ------------------------------------------------------ */}

      <section className="pt-2 border-t border-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Active Subjects
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a subject to view its NCTB chapters.
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
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

          <p className="mt-4 text-[11px] text-slate-400">
            Tip: Open <span className="font-semibold text-slate-500">Add Routine Block</span> first, then select a chapter to place it in the Activity field.
          </p>
        </div>
      </section>

      {routineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800">
                  Delete routine?
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {routineToDelete.title}
                  </span>
                  ?
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {routineToDelete.startTime} – {routineToDelete.endTime}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoutineToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteRoutineBlock(routineToDelete.id);
                  setRoutineToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                Delete Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
