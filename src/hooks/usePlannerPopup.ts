import { useCallback, useEffect, useId, useRef } from "react";

// Every planner popup keeps its own placement and keyboard behaviour, but only
// one can be interactive at a time. Closing another popup never steals focus.
const OPEN_EVENT = "studypilot:planner-popup";
export default function usePlannerPopup(onClose: () => void) {
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const closeOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) closeRef.current();
    };
    document.addEventListener(OPEN_EVENT, closeOther);
    return () => document.removeEventListener(OPEN_EVENT, closeOther);
  }, [id]);
  return useCallback(() => {
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
  }, [id]);
}
