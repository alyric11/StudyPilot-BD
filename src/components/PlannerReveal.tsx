import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Keep content mounted so width and natural-height changes share one layout. */
export default function PlannerReveal({ open, children, contentWidth }: { open: boolean; children: ReactNode; contentWidth?: number }) {
  const lastOpenChildren = useRef<ReactNode>(null);
  const lastOpenWidth = useRef<number | undefined>(contentWidth);
  useLayoutEffect(() => {
    if (open) { lastOpenChildren.current = children; lastOpenWidth.current = contentWidth; }
  }, [open, children, contentWidth]);

  return (
    <div className="planner-reveal" data-open={open} aria-hidden={!open} inert={!open}>
      {/* Keep the last open content while closing: resetting an editor's state
          must not remove its chapter/padding before the height transition. */}
      <div className="planner-reveal-inner" style={{ width: open ? contentWidth : lastOpenWidth.current }}>{open ? children : lastOpenChildren.current}</div>
    </div>
  );
}
