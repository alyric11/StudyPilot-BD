import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  label?: string;
}

function formatDisplayTime(value: string): string {
  const [hourString, minute] = value.split(":");
  const hour = Number(hourString);

  if (hour === 0) {
    return `12:${minute} AM`;
  }

  if (hour < 12) {
    return `${String(hour).padStart(2, "0")}:${minute} AM`;
  }

  if (hour === 12) {
    return `12:${minute} PM`;
  }

  return `${String(hour - 12).padStart(2, "0")}:${minute} PM`;
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
  label
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const current = parseTime(value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const updateTime = (
    hour: number,
    minute: number,
    period: "AM" | "PM"
  ) => {
    onChange(buildTime(hour, minute, period));
  };

  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className={`w-full h-11 px-3 border rounded-xl text-sm bg-white text-slate-800 flex items-center focus:outline-none ${open
            ? "border-indigo-500 ring-1 ring-indigo-500"
            : "border-slate-200"
          }`}
      >
        {label && (
          <span className="font-semibold text-slate-600 shrink-0">
            {label}
          </span>
        )}

        <span className="mx-3 h-5 w-px bg-slate-200" />

        <Clock className="h-4 w-4 shrink-0 text-blue-500" />

        <span className="mx-3 h-5 w-px bg-slate-200" />

        <span className="min-w-0 flex-1 text-left font-medium">
          {formatDisplayTime(value)}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-slate-100">

            {/* Hour */}
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-100">
                Hour
              </div>

              <div className="max-h-56 overflow-y-auto p-2">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() =>
                      updateTime(
                        hour,
                        current.minute,
                        current.period as "AM" | "PM"
                      )
                    }
                    className={`w-full py-2 rounded-md text-sm font-medium ${current.hour === hour
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-indigo-50"
                      }`}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute */}
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-100">
                Minute
              </div>

              <div className="max-h-56 overflow-y-auto p-2">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() =>
                      updateTime(
                        current.hour,
                        minute,
                        current.period as "AM" | "PM"
                      )
                    }
                    className={`w-full py-2 rounded-md text-sm font-medium ${current.minute === minute
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-indigo-50"
                      }`}
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* AM / PM */}
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center border-b border-slate-100">
                AM/PM
              </div>

              <div className="p-2 space-y-2">
                {(["AM", "PM"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() =>
                      updateTime(
                        current.hour,
                        current.minute,
                        period
                      )
                    }
                    className={`w-full py-2 rounded-md text-sm font-medium ${current.period === period
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-indigo-50"
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}