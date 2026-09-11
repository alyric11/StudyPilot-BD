import React, { useState } from "react";

import {
  UserProfile,
  StudyPlanResponse,
  RoutineBlock
} from "../types";

import {
  Clock,
  Flame,
  CheckCircle,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle
} from "lucide-react";
import TimePicker from "./TimePicker";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Array<{
    id: string;
    name: string;
    banglaName: string;
  }>;
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
  "violet"
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

    const color =
      existingBlock?.color ??
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
  // Existing AI Daily Planner
  // ------------------------------------------------------------

  const [hours, setHours] = useState("2");

  const [selectedSubjects, setSelectedSubjects] =
    useState<string[]>(
      subjects.slice(0, 3).map((s) => s.name)
    );

  const [generating, setGenerating] =
    useState(false);

  const [planResult, setPlanResult] =
    useState<StudyPlanResponse | null>(null);

  const [errors, setErrors] = useState<{
    hours?: string;
    subjects?: string;
  }>({});

  const [apiWarning, setApiWarning] =
    useState<string | null>(null);

  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) => {
      const next = prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name];

      if (next.length > 0 && errors.subjects) {
        setErrors((errs) => ({
          ...errs,
          subjects: undefined
        }));
      }

      return next;
    });
  };

  const generateLocalFallbackPlan = (
    numHours: number,
    subjectList: string[]
  ): StudyPlanResponse => {
    const totalMin = Math.round(numHours * 60);
    const revisionMin = 15;
    const studyPool = totalMin - revisionMin;
    const subjectsCount = Math.max(
      subjectList.length,
      1
    );
    const blockMin = Math.max(
      Math.floor(studyPool / subjectsCount),
      15
    );

    const items: Array<{
      timeInMinutes: number;
      subject: string;
      chapter: string;
      activity: string;
    }> = [];

    subjectList.forEach((subName) => {
      const subObj = subjects.find(
        (s) => s.name === subName
      );

      const subTitle = subObj
        ? `${subObj.banglaName} (${subObj.name})`
        : subName;

      items.push({
        timeInMinutes: blockMin,
        subject: subTitle,
        chapter: "Syllabus Core Study",
        activity:
          "Review key textbook sections, write out equations in your notebook, and solve Creative Question (CQ) exercises."
      });
    });

    items.push({
      timeInMinutes: revisionMin,
      subject: "Revision Block",
      chapter: "Formulas & Diaries",
      activity:
        "Revise formulas in your Study Diary, review custom equations, and check off completed syllabus topics."
    });

    return {
      totalMinutes: totalMin,
      plan: items,
      motivationQuote:
        "সাফল্যের রাস্তা একটাই—পরিশ্রম ও ধারাবাহিকতা। Every step counts! Keep going!"
    };
  };

  const handleGeneratePlan = async () => {
    const newErrors: typeof errors = {};

    setApiWarning(null);

    const parsedHours = parseFloat(hours);

    if (isNaN(parsedHours) || parsedHours <= 0) {
      newErrors.hours =
        "Please enter a valid study duration.";
    } else if (parsedHours < 0.5) {
      newErrors.hours =
        "Minimum study time is 0.5 hours.";
    } else if (parsedHours > 16) {
      newErrors.hours =
        "Maximum study time is capped at 16 hours.";
    }

    if (selectedSubjects.length === 0) {
      newErrors.subjects =
        "Please select at least 1 subject to build your plan.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGenerating(true);

    try {
      const res = await fetch(
        "/api/generate-study-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            hours: parsedHours.toString(),
            subjects: selectedSubjects,
            classLevel: profile.classLevel,
            group: profile.group
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        setPlanResult(data);
      } else {
        throw new Error(
          "Server returned an error status"
        );
      }
    } catch (err) {
      console.warn(
        "Could not generate plan from API, using custom offline algorithm instead.",
        err
      );

      const offlinePlan =
        generateLocalFallbackPlan(
          parsedHours,
          selectedSubjects
        );

      setPlanResult(offlinePlan);

      setApiWarning(
        "Unable to reach AI co-pilot. Generated an optimized offline study routine for you instead!"
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-8"
      id="study-planner-container"
    >
      {/* ------------------------------------------------------ */}
      {/* Weekly Routine */}
      {/* ------------------------------------------------------ */}

      <section className="space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-6 h-6" />
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

        {/* Add Routine */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowRoutineForm((prev) => !prev)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showRoutineForm ? "Close" : "Add Routine Block"}
          </button>
        </div>

        {showRoutineForm && (
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700">
                  Add Routine Block
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  Add a recurring activity to your weekly schedule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Day */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Day
                </label>

                <select
                  value={routineDay}
                  onChange={(e) => setRoutineDay(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {DAYS.map((day) => (
                    <option
                      key={day.value}
                      value={day.value}
                    >
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Activity
                </label>

                <input
                  type="text"
                  value={routineTitle}
                  onChange={(e) => setRoutineTitle(e.target.value)}
                  placeholder="e.g. Chemistry"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Start */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Start
                </label>

                <TimePicker
                  value={routineStart}
                  onChange={setRoutineStart}
                />
              </div>

              {/* End */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  End
                </label>

                <TimePicker
                  value={routineEnd}
                  onChange={setRoutineEnd}
                />
              </div>
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
                  className={`shrink-0 rounded-lg border px-3 py-2 text-left transition ${isSelected
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
                  className={`min-h-[180px] rounded-xl border p-3 ${isToday
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 bg-white"
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

                    {isToday && (
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Routine blocks */}
                  <div className="space-y-2">
                    {dayBlocks.length > 0 ? (
                      dayBlocks.map((block) => (
                        <div
                          key={block.id}
                          className={`group rounded-lg border p-2.5 shadow-sm transition ${ROUTINE_COLOR_STYLES[block.color as keyof typeof ROUTINE_COLOR_STYLES]?.card ??
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
                            {block.title}
                          </div>

                          <button
                            type="button"
                            onClick={() => setRoutineToDelete(block)}
                            className="mt-2 text-xs text-slate-400 transition hover:text-red-500"
                            aria-label={`Delete ${block.title}`}
                          >
                            Delete
                          </button>
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
                          className={`rounded-xl border p-3 ${ROUTINE_COLOR_STYLES[
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
                            {block.title}
                          </div>

                          <button
                            type="button"
                            onClick={() => setRoutineToDelete(block)}
                            className="mt-2 text-xs text-slate-400 hover:text-red-500"
                            aria-label={`Delete ${block.title}`}
                          >
                            Delete
                          </button>
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
      {/* Existing AI Daily Planner */}
      {/* ------------------------------------------------------ */}

      <section className="pt-2 border-t border-slate-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
              Daily Study Planner
            </h2>

            <p className="text-slate-400 text-xs">
              Generate an AI-guided study plan for today's available study time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Setup Column */}
          <div className="lg:col-span-2 space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
              Flight Controls
            </h3>

            {/* Hours Input */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-slate-500"
                htmlFor="hours-input"
              >
                Available Study Time Today (Hours)
              </label>

              <div className="relative">
                <input
                  id="hours-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);

                    if (errors.hours) {
                      setErrors((prev) => ({
                        ...prev,
                        hours: undefined
                      }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500 ${errors.hours
                    ? "border-rose-300 focus:ring-1 focus:ring-rose-100"
                    : "border-slate-200"
                    }`}
                />

                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                  Hours
                </span>
              </div>

              {errors.hours && (
                <p className="text-rose-600 text-[9px] font-semibold">
                  {errors.hours}
                </p>
              )}

              <p className="text-[10px] text-slate-400">
                Usually 1.5 to 3 hours are highly recommended for daily self-study.
              </p>
            </div>

            {/* Subjects Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">
                Prioritize Today's Subjects
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() =>
                      toggleSubject(sub.name)
                    }
                    className={`p-2 rounded-lg border text-left transition-all text-xs flex items-center justify-between cursor-pointer ${selectedSubjects.includes(
                      sub.name
                    )
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    <span>
                      {sub.banglaName} ({sub.name})
                    </span>

                    <CheckCircle
                      className={`w-3.5 h-3.5 ${selectedSubjects.includes(
                        sub.name
                      )
                        ? "text-indigo-500 fill-indigo-100"
                        : "text-transparent"
                        }`}
                    />
                  </button>
                ))}
              </div>

              {errors.subjects && (
                <p className="text-rose-600 text-[9px] font-semibold">
                  {errors.subjects}
                </p>
              )}
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="plan-generate-btn"
            >
              <Sparkles className="w-4 h-4" />

              {generating
                ? "AI is Calculating Timings..."
                : "Generate Guided Flight Plan"}
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-4">
            {apiWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs flex items-start gap-2.5 shadow-xs">
                <span className="text-base">⚠️</span>

                <div>
                  <p className="font-bold">
                    Offline Planner Active
                  </p>

                  <p className="text-amber-700 mt-0.5">
                    {apiWarning}
                  </p>
                </div>
              </div>
            )}

            {generating ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-4 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">
                    Pilot AI is Plotting Your Study Plan...
                  </h4>

                  <p className="text-xs text-slate-400 max-w-xs">
                    Splitting available time, designing revision blocks, and finding custom learning milestones.
                  </p>
                </div>
              </div>
            ) : planResult ? (
              <div
                className="space-y-5"
                id="study-plan-output"
              >
                {/* Motivation quote */}
                <div className="bg-slate-900 p-4.5 rounded-xl text-white shadow-sm flex items-start gap-3">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Daily Inspiration
                    </h4>

                    <p className="text-xs italic font-medium leading-relaxed mt-0.5 text-slate-200">
                      "{planResult.motivationQuote}"
                    </p>
                  </div>
                </div>

                {/* Timeline list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Today's Step-by-Step Schedule
                  </h3>

                  <div className="relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100 space-y-4">
                    {planResult.plan.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 relative"
                        >
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>

                          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/50 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-slate-300 hover:bg-white transition-all duration-250">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {item.subject}
                              </span>

                              <h4 className="text-xs font-semibold text-slate-800 font-display">
                                {item.chapter}
                              </h4>

                              <p className="text-xs text-slate-500">
                                {item.activity}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-1 bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full border border-indigo-100/40 self-start sm:self-center">
                              <Clock className="w-3.5 h-3.5" />
                              {item.timeInMinutes} mins
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Clock className="w-8 h-8 text-slate-300" />

                <h4 className="text-sm font-bold text-slate-600">
                  No Plan Generated
                </h4>

                <p className="text-xs text-slate-400 max-w-xs">
                  Select your study time and subjects in the left column to create today's custom co-pilot schedule.
                </p>
              </div>
            )}
          </div>
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
