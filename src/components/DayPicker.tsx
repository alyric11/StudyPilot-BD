import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import usePlannerPopup from "../hooks/usePlannerPopup";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { getVerticalFloatingPosition } from "../utils/floatingPosition";

interface DayOption {
  value: number;
  label: string;
}

interface DayPickerProps {
  value: string;
  onChange: (value: string) => void;
  days: DayOption[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const toDayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const calendarDays = (month: Date) => {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  // Saturday is the first column in StudyPilot's week.
  const leadingDays = (firstOfMonth.getDay() + 1) % 7;
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export default function DayPicker({
  value, onChange, days, selectedDate, onDateSelect,
}: DayPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const pickerId = useId();
  const [openMenu, setOpenMenu] = useState<"days" | "calendar" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const pickerRef = useRef<HTMLDivElement>(null);
  const dayButtonRef = useRef<HTMLButtonElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 0,
    placement: "below" as "above" | "below",
  });

  const selectedDay = days.find((day) => String(day.value) === value)?.label ?? "Select day";
  const today = toDayStart(new Date());
  const closePicker = useCallback(() => {
    if (!openMenu || isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null);
      setIsClosing(false);
    }, shouldReduceMotion ? 0 : 200);
  }, [isClosing, openMenu, shouldReduceMotion]);

  const updateDropdownPosition = useCallback((menu = openMenu) => {
    const button = menu === "calendar" ? calendarButtonRef.current : dayButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const desiredWidth = menu === "calendar" ? 288 : rect.width;
    const estimatedHeight = menu === "calendar" ? 420 : 316;
    const position = getVerticalFloatingPosition(rect, desiredWidth, estimatedHeight);
    setDropdownPosition({
      ...position,
      placement: position.placement === "above" ? "above" : "below",
    });
  }, [openMenu]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) closePicker();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [closePicker]);

  useEffect(() => {
    if (!openMenu) return;
    updateDropdownPosition();
    const update = () => updateDropdownPosition();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [openMenu, updateDropdownPosition]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const claimPopup = usePlannerPopup(closePicker);

  const togglePicker = (menu: "days" | "calendar") => {
    if (openMenu === menu && !isClosing) {
      closePicker();
      return;
    }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    claimPopup();
    updateDropdownPosition(menu);
    if (menu === "calendar") {
      setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
    setIsClosing(false);
    setOpenMenu(menu);
    window.requestAnimationFrame(() => updateDropdownPosition(menu));
  };

  useEffect(() => {
    if (!openMenu || isClosing) return;
    const frame = requestAnimationFrame(() => {
      const selected = dropdownRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"], [data-calendar-date][aria-pressed="true"]');
      const fallback = dropdownRef.current?.querySelector<HTMLButtonElement>('[data-calendar-date]');
      (selected ?? fallback)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [openMenu, isClosing]);

  const selectDay = (day: DayOption) => {
    onChange(String(day.value));
    closePicker();
    dayButtonRef.current?.focus();
  };

  const selectDate = (date: Date) => {
    onDateSelect(toDayStart(date));
    closePicker();
    calendarButtonRef.current?.focus();
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const options = Array.from(dropdownRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const currentIndex = options.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
    options[nextIndex]?.focus();
  };

  const isCalendar = openMenu === "calendar";
  const calendarLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="relative" ref={pickerRef}>
      <div data-state={openMenu ? "open" : "closed"} className="planner-selector flex h-11 items-stretch rounded-xl border">
        <button
          ref={dayButtonRef}
          type="button"
          onClick={() => togglePicker("days")}
          onKeyDown={(event) => {
            if (!openMenu && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault();
              togglePicker("days");
            }
          }}
          aria-label={`Day: ${selectedDay}`}
          aria-haspopup="listbox"
          aria-expanded={openMenu === "days"}
          aria-controls={`day-picker-${pickerId}`}
          className="planner-focus flex min-w-0 flex-1 items-center rounded-l-xl px-3 text-left text-sm"
        >
          <span className="font-semibold text-slate-600">Day</span>
          <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />
          <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{selectedDay}</span>
          <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${openMenu === "days" ? "rotate-180" : ""}`} />
        </button>

        <span className="my-2.5 w-px bg-[#e2e8f0]" />

        <button
          ref={calendarButtonRef}
          type="button"
          onClick={() => togglePicker("calendar")}
          aria-label={`View week or choose a repeating weekday: ${calendarLabel}`}
          aria-haspopup="dialog"
          aria-expanded={isCalendar}
          aria-controls={`routine-calendar-${pickerId}`}
          title="View a week · routines repeat every week"
          className={`planner-focus m-1 flex w-9 shrink-0 items-center justify-center rounded-lg border transition ${
            isCalendar
              ? "border-indigo-400 bg-indigo-100 text-indigo-700 shadow-sm"
              : "border-indigo-200 bg-indigo-50 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-100"
          }`}
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {openMenu && createPortal(
        <div
          ref={dropdownRef}
          inert={isClosing}
          data-planner-popup
          data-placement={dropdownPosition.placement}
          id={isCalendar ? `routine-calendar-${pickerId}` : `day-picker-${pickerId}`}
          role={isCalendar ? "dialog" : "listbox"}
          aria-label={isCalendar ? "View a week or choose a repeating weekday" : "Choose a routine day"}
          onKeyDown={(event) => {
            if (isCalendar && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
              const dates = Array.from(dropdownRef.current?.querySelectorAll<HTMLButtonElement>("[data-calendar-date]") ?? []);
              const index = dates.indexOf(event.target as HTMLButtonElement);
              if (index >= 0) {
                event.preventDefault();
                const next = event.key === "Home" ? index - index % 7 : event.key === "End" ? Math.min(dates.length - 1, index - index % 7 + 6)
                  : index + ({ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7}[event.key] ?? 0);
                dates[Math.max(0, Math.min(dates.length - 1, next))]?.focus({ preventScroll: true });
              }
            }
            if (event.key === "Escape") {
              event.preventDefault();
              closePicker();
              (isCalendar ? calendarButtonRef : dayButtonRef).current?.focus();
            }
          }}
          className={`routine-dropdown planner-selector-menu fixed z-[100] overflow-x-hidden overflow-y-auto rounded-xl border bg-white p-1.5 ${
            dropdownPosition.placement === "above" ? "routine-dropdown-above" : ""
          } ${
            isClosing
              ? dropdownPosition.placement === "above" ? "routine-dropdown-closing-up" : "routine-dropdown-closing"
              : dropdownPosition.placement === "above" ? "routine-dropdown-opening-up" : "routine-dropdown-opening"
          }`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: dropdownPosition.maxHeight,
          }}
        >
          {isCalendar ? (
            <div className="p-1">
              <p className="mb-2 px-1 text-xs leading-relaxed text-slate-600">Dates preview your weekly routine, not past history. New blocks repeat every week.</p>
              <div className="mb-2 flex items-center justify-between gap-1 px-1">
                <button type="button" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="planner-focus flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
                <div className="text-xs font-bold text-slate-700">{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
                <button type="button" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="planner-focus flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 px-1 text-center text-[9px] font-bold uppercase text-slate-400">
                {days.map((day) => <span key={day.value}>{day.label.slice(0, 1)}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-0.5">
                {calendarDays(calendarMonth).map((date) => {
                  const selected = isSameDate(date, selectedDate);
                  const currentMonth = date.getMonth() === calendarMonth.getMonth();
                  const isToday = isSameDate(date, today);
                  return (
                    <button
                      key={date.toISOString()}
                      data-calendar-date
                      type="button"
                      onClick={() => selectDate(date)}
                      aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      aria-pressed={selected}
                      className={`planner-focus h-8 rounded-lg text-[11px] font-medium transition ${
                        selected ? "bg-[#eeefff] text-[#5144bd] ring-1 ring-inset ring-[#d2ceff]" : isToday ? "border border-indigo-200 bg-indigo-50 text-indigo-700" : currentMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-slate-50"
                      }`}
                    >{date.getDate()}</button>
                  );
                })}
              </div>
              <button type="button" onClick={() => selectDate(today)} className="planner-focus mt-2 w-full rounded-lg border border-indigo-100 bg-indigo-50 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100">Today</button>
            </div>
          ) : (
            <div className="max-h-[316px] overflow-y-auto p-0.5">
              {days.map((day) => {
                const isSelected = String(day.value) === value;
                return (
                  <button key={day.value} type="button" role="option" aria-selected={isSelected} onKeyDown={handleOptionKeyDown} onClick={() => selectDay(day)} className="planner-focus planner-selector-option w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition">{day.label}</button>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
