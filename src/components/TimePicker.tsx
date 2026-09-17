import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import usePlannerPopup from "../hooks/usePlannerPopup";
import { Clock } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { getVerticalFloatingPosition } from "../utils/floatingPosition";
import { formatTime12Hour } from "../utils/time";

interface TimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  label?: string;
  onPeriodChange?: (value: string) => void;
  closeOnPeriodChange?: boolean;
  openRequest?: number;
  onOpenRequestHandled?: () => void;
}

function parseTime(value: string) {
  const [hourString, minute] = value.split(":");
  const hour24 = Number(hourString);

  const period = hour24 >= 12 ? "PM" : "AM";

  let hour12 = hour24 % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return {
    hour: hour12,
    minute: Number(minute),
    period
  };
}

function buildTime(hour12: number, minute: number, period: "AM" | "PM") {
  let hour24 = hour12;

  if (period === "AM" && hour12 === 12) {
    hour24 = 0;
  }

  if (period === "PM" && hour12 !== 12) {
    hour24 = hour12 + 12;
  }

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function TimePicker({
  value,
  onChange,
  label,
  onPeriodChange,
  closeOnPeriodChange = false,
  openRequest = 0,
  onOpenRequestHandled
}: TimePickerProps) {
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

  const current = parseTime(value);

  const closePicker = useCallback(() => {
    if (!open || isClosing) {
      return;
    }

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
    const measuredHeight = dropdownRef.current?.offsetHeight || 300;
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

  const claimPopup = usePlannerPopup(closePicker);

  const togglePicker = () => {
    if (open && !isClosing) {
      closePicker();
      return;
    }

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    claimPopup();
    updateDropdownPosition();
    setIsClosing(false);
    setOpen(true);
  };

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

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
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
        ?.querySelector<HTMLButtonElement>(
          '[data-time-option="hour"][aria-pressed="true"]'
        )
        ?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isClosing, open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (openRequest === 0) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    claimPopup();
    updateDropdownPosition();
    setIsClosing(false);
    setOpen(true);
    onOpenRequestHandled?.();
  }, [onOpenRequestHandled, openRequest, updateDropdownPosition, claimPopup]);

  const updateTime = (
    hour: number,
    minute: number,
    period: "AM" | "PM",
    isPeriodChange = false
  ) => {
    const nextTime = buildTime(hour, minute, period);
    onChange(nextTime);

    if (isPeriodChange) {
      onPeriodChange?.(nextTime);

      if (closeOnPeriodChange) {
        closePicker();
      }
    }
  };

  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  // Keep routine start and end times on quarter-hour boundaries.
  const minutes = [0, 15, 30, 45];

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    optionType: "hour" | "minute" | "period"
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const options = Array.from(
      dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        `[data-time-option="${optionType}"]`
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
        aria-label={`${label ? `${label} time` : "Time"}: ${formatTime12Hour(value)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`time-picker-${pickerId}`}
        data-state={open ? "open" : "closed"}
        className="planner-time-trigger planner-focus planner-selector flex h-11 w-full items-center rounded-xl border px-3 text-sm text-slate-800 focus:outline-none"
      >
        {label && (
          <span className="font-semibold text-slate-600 shrink-0">
            {label}
          </span>
        )}

        <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />

        <Clock className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />

        <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />

        <span className="min-w-0 flex-1 whitespace-nowrap text-left font-medium">
          {formatTime12Hour(value)}
        </span>
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          inert={isClosing}
          data-planner-popup
          data-placement={dropdownPosition.placement}
          id={`time-picker-${pickerId}`}
          role="dialog"
          aria-label={`Choose ${label?.toLowerCase() ?? "a"} time`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closePicker();
              buttonRef.current?.focus();
            }
          }}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: dropdownPosition.maxHeight,
          }}
          className={`routine-dropdown planner-selector-menu fixed z-[100] overflow-x-hidden overflow-y-auto rounded-xl border bg-white ${
            dropdownPosition.placement === "above" ? "routine-dropdown-above" : ""
          } ${
            isClosing
              ? dropdownPosition.placement === "above"
                ? "routine-dropdown-closing-up"
                : "routine-dropdown-closing"
              : dropdownPosition.placement === "above"
                ? "routine-dropdown-opening-up"
                : "routine-dropdown-opening"
          }`}
        >
          <div className="grid grid-cols-3 divide-x divide-[#edf1f7]">

            {/* Hour */}
            <div role="group" aria-label="Hour">
              <div className="border-b border-[#edf1f7] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hour
              </div>

              <div className="max-h-56 overflow-y-auto p-2">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    data-time-option="hour"
                    aria-pressed={current.hour === hour}
                    onKeyDown={(event) => handleOptionKeyDown(event, "hour")}
                    onClick={() =>
                      updateTime(
                        hour,
                        current.minute,
                        current.period as "AM" | "PM"
                      )
                    }
                    className="planner-focus planner-selector-option w-full rounded-md py-2 text-sm font-medium"
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute */}
            <div role="group" aria-label="Minute">
              <div className="border-b border-[#edf1f7] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Minute
              </div>

              <div className="max-h-56 overflow-y-auto p-2">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    data-time-option="minute"
                    aria-pressed={current.minute === minute}
                    onKeyDown={(event) => handleOptionKeyDown(event, "minute")}
                    onClick={() =>
                      updateTime(
                        current.hour,
                        minute,
                        current.period as "AM" | "PM"
                      )
                    }
                    className="planner-focus planner-selector-option w-full rounded-md py-2 text-sm font-medium"
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* AM / PM */}
            <div role="group" aria-label="AM or PM">
              <div className="border-b border-[#edf1f7] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AM/PM
              </div>

              <div className="p-2 space-y-2">
                {(["AM", "PM"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    data-time-option="period"
                    aria-pressed={current.period === period}
                    onKeyDown={(event) => handleOptionKeyDown(event, "period")}
                    onClick={() =>
                      updateTime(
                        current.hour,
                        current.minute,
                        period,
                        true
                      )
                    }
                    className="planner-focus planner-selector-option w-full rounded-md py-2 text-sm font-medium"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
