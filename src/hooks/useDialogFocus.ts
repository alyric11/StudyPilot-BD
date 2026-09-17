import { useEffect, useRef, type RefObject } from "react";

// Shared keyboard behaviour for the landing-page dialogs and mobile navigation.
export default function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getTargets = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], select, textarea, [tabindex="0"]'
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => (getTargets()[0] ?? ref.current)?.focus({ preventScroll: true }));
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab") return;
      const targets = getTargets();
      const first = targets[0], last = targets[targets.length - 1];
      if (!first) { event.preventDefault(); ref.current?.focus(); return; }
      if (!ref.current?.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
