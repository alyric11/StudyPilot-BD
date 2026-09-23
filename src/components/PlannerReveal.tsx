import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Keep content mounted so width and natural-height changes share one layout. */
export default function PlannerReveal({ open, children }: { open: boolean; children: ReactNode }) {
  const lastOpenChildren = useRef<ReactNode>(null);
  useLayoutEffect(() => {
    if (open) lastOpenChildren.current = children;
  }, [open, children]);

  return (
    <div className="planner-reveal" data-open={open} aria-hidden={!open} inert={!open}>
      {/* Keep the last open content while closing: resetting an editor's state
          must not remove its chapter/padding before the height transition. */}
      <div className="planner-reveal-inner">{open ? children : lastOpenChildren.current}</div>
    </div>
  );
}
