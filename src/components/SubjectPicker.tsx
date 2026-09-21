import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import usePlannerPopup from "../hooks/usePlannerPopup";
import { getVerticalFloatingPosition } from "../utils/floatingPosition";

export interface SubjectPickerOption {
  key: string;
  label: string;
  secondaryLabel?: string;
}

interface SubjectPickerProps {
  value: string;
  options: SubjectPickerOption[];
  onChange: (option: SubjectPickerOption) => void;
  openRequest?: number;
  onOpenRequestHandled?: () => void;
}

export default function SubjectPicker({
  value,
  options,
  onChange,
  openRequest = 0,
  onOpenRequestHandled,
}: SubjectPickerProps) {
  const shouldReduceMotion = useReducedMotion();
  const pickerId = useId();
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedOption = options.find((option) => option.key === value);

  const closePicker = useCallback(() => {
    if (!isOpen || isClosing) return;

    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, shouldReduceMotion ? 0 : 200);
  }, [isClosing, isOpen, shouldReduceMotion]);

  const updateDropdownPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const position = getVerticalFloatingPosition(rect, rect.width, 300);

    setDropdownPosition({
      ...position,
      placement: position.placement === "above" ? "above" : "below",
    });
  }, []);

  const claimPopup = usePlannerPopup(closePicker);

  const togglePicker = () => {
    if (isOpen && !isClosing) {
      closePicker();
      return;
    }

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    claimPopup();
    updateDropdownPosition();
    setIsClosing(false);
    setIsOpen(true);
    window.requestAnimationFrame(updateDropdownPosition);
  };

  useEffect(() => {
    if (openRequest === 0) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    claimPopup();
    updateDropdownPosition();
    setIsClosing(false);
    setIsOpen(true);
    window.requestAnimationFrame(updateDropdownPosition);
    onOpenRequestHandled?.();
  }, [claimPopup, onOpenRequestHandled, openRequest, updateDropdownPosition]);

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
    if (!isOpen) return;

    const update = () => updateDropdownPosition();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen || isClosing) return;

    const frame = window.requestAnimationFrame(() => {
      const selected = dropdownRef.current?.querySelector<HTMLButtonElement>(
        '[aria-selected="true"]'
      );
      const first = dropdownRef.current?.querySelector<HTMLButtonElement>(
        '[role="option"]'
      );

      (selected ?? first)?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, isClosing]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    []
  );

  const selectSubject = (option: SubjectPickerOption) => {
    onChange(option);
    closePicker();
    buttonRef.current?.focus();
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    const optionButtons = Array.from(
      dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]'
      ) ?? []
    );

    const currentIndex = optionButtons.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = optionButtons.length - 1;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % optionButtons.length;
    }
    if (event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + optionButtons.length) % optionButtons.length;
    }

    optionButtons[nextIndex]?.focus({ preventScroll: true });
  };

  return (
    <div ref={pickerRef} className="relative">
      <div
        data-state={isOpen ? "open" : "closed"}
        className="planner-selector flex h-11 items-stretch rounded-xl border"
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={togglePicker}
          onKeyDown={(event) => {
            if (
              !isOpen &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              event.preventDefault();
              togglePicker();
            }
          }}
          aria-label={`Subject: ${selectedOption?.label ?? "Select subject"}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`subject-picker-${pickerId}`}
          className="planner-focus flex min-w-0 flex-1 items-center rounded-xl px-3 text-left text-sm"
        >
          <span className="font-semibold text-slate-600">Subject</span>
          <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />
          <BookOpen className="h-4 w-4 shrink-0 text-purple-500" />
          <span className="mx-3 h-5 w-px bg-[#e2e8f0]" />
          <span
            className={`min-w-0 flex-1 truncate font-medium ${
              selectedOption ? "text-slate-800" : "text-slate-400"
            }`}
          >
            {selectedOption?.label ?? "Select subject"}
          </span>
          <ChevronDown
            className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <motion.div
            ref={dropdownRef}
            initial={
              shouldReduceMotion
                ? false
                : dropdownPosition.placement === "above"
                  ? {
                      opacity: 0,
                      clipPath: "inset(100% 0 0 0 round 12px)",
                    }
                  : {
                      opacity: 0,
                      clipPath: "inset(0 0 100% 0 round 12px)",
                    }
            }
            animate={
              isClosing
                ? dropdownPosition.placement === "above"
                  ? {
                      opacity: 0,
                      clipPath: "inset(100% 0 0 0 round 12px)",
                    }
                  : {
                      opacity: 0,
                      clipPath: "inset(0 0 100% 0 round 12px)",
                    }
                : {
                    opacity: 1,
                    clipPath: "inset(0 0 0 0 round 12px)",
                  }
            }
            transition={
              isClosing
                ? {
                    duration: shouldReduceMotion ? 0 : 0.2,
                    ease: [0.4, 0, 1, 1],
                  }
                : {
                    duration: shouldReduceMotion ? 0 : 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
            inert={isClosing}
            data-planner-popup
            data-placement={dropdownPosition.placement}
            id={`subject-picker-${pickerId}`}
            role="listbox"
            aria-label="Choose an active subject"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closePicker();
                buttonRef.current?.focus();
              }
            }}
            className={`routine-dropdown planner-selector-menu fixed z-[100] overflow-hidden rounded-xl border bg-white p-1.5 ${
              dropdownPosition.placement === "above"
                ? "routine-dropdown-above"
                : ""
            }`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: dropdownPosition.maxHeight,
            }}
          >
            <div className="max-h-[280px] overflow-y-auto p-0.5">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.key === value;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onKeyDown={handleOptionKeyDown}
                      onClick={() => selectSubject(option)}
                      className="planner-focus planner-selector-option flex h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-medium transition"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {option.secondaryLabel && (
                        <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                          {option.secondaryLabel}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-sm text-slate-400">
                  No active subjects available.
                </div>
              )}
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  );
}
