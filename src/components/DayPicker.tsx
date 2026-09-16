import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown } from "lucide-react";
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
}

export default function DayPicker({ value, onChange, days }: DayPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const pickerId = useId();
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  const closePicker = useCallback(() => {
    if (!open || isClosing) return;

    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, shouldReduceMotion ? 0 : 200);
  }, [isClosing, open, shouldReduceMotion]);

  const updateDropdownPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const measuredHeight = dropdownRef.current?.offsetHeight || 316;
    const position = getVerticalFloatingPosition(
      rect,
      rect.width,
      measuredHeight
    );

    setDropdownPosition({
      ...position,
      placement: position.placement === "above" ? "above" : "below",
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        closePicker();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [closePicker]);

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open || isClosing) return;

    const frame = window.requestAnimationFrame(() => {
      dropdownRef.current
        ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
        ?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isClosing, open]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const togglePicker = () => {
    if (open) {
      closePicker();
      return;
    }

    updateDropdownPosition();
    setIsClosing(false);
    setOpen(true);
  };

  const selectDay = (day: DayOption) => {
    onChange(String(day.value));
    closePicker();
    buttonRef.current?.focus();
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const options = Array.from(
      dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]'
      ) ?? []
    );
    const currentIndex = options.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    }
    if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }

    options[nextIndex]?.focus();
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            togglePicker();
          }
        }}
        aria-label={`Day: ${selectedDay}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`day-picker-${pickerId}`}
        data-state={open ? "open" : "closed"}
        className="planner-focus planner-selector flex h-11 w-full items-center rounded-xl border px-3 text-left text-sm transition focus:outline-none"
      >
        <span className="font-semibold text-slate-600">Day</span>
        <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />
        <CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />
        <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />
        <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{selectedDay}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <div className={`routine-dropdown planner-selector-menu z-[100] overflow-x-hidden overflow-y-auto rounded-xl border bg-white p-1.5 ${
          dropdownPosition.placement === "above" ? "routine-dropdown-above" : ""
        } ${
          isClosing
            ? dropdownPosition.placement === "above"
              ? "routine-dropdown-closing-up"
              : "routine-dropdown-closing"
            : dropdownPosition.placement === "above"
              ? "routine-dropdown-opening-up"
              : "routine-dropdown-opening"
        }`} style={{
          position: "fixed",
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: dropdownPosition.maxHeight,
        }}
          ref={dropdownRef}
          id={`day-picker-${pickerId}`}
          role="listbox"
          aria-label="Choose a routine day"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closePicker();
              buttonRef.current?.focus();
            }
          }}
        >
          {days.map((day) => {
            const isSelected = String(day.value) === value;

            return (
              <button
                key={day.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onKeyDown={handleOptionKeyDown}
                onClick={() => selectDay(day)}
                className="planner-focus planner-selector-option w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition"
              >
                {day.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
