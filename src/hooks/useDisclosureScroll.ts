import { useLayoutEffect, useRef, type RefObject } from "react";

/** Follow the disclosure's actual animated height rather than starting a second animation. */
export default function useDisclosureScroll(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  revealRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
) {
  const pending = useRef<{ scroll: number; height: number; top: number; panelHeight: number } | null>(null);
  const returnPosition = useRef<{ before: number; after: number } | null>(null);
  const stop = useRef<() => void>(() => {});

  const prepare = () => {
    stop.current();
    const panel = panelRef.current;
    const reveal = revealRef.current;
    if (!panel || !reveal) return;
    const rect = panel.getBoundingClientRect();
    pending.current = {
      scroll: window.scrollY,
      height: reveal.getBoundingClientRect().height,
      top: rect.top,
      panelHeight: rect.height,
    };
  };

  useLayoutEffect(() => {
    const snapshot = pending.current;
    pending.current = null;
    const panel = panelRef.current;
    const reveal = revealRef.current;
    const content = contentRef.current;
    if (!snapshot || !panel || !reveal || !content) return;

    const headerBottom = document.getElementById("app-top-header")?.getBoundingClientRect().bottom ?? 0;
    const footerTop = document.querySelector("#study-pilot-app-shell > footer")?.getBoundingClientRect().top ?? window.innerHeight;
    const visibleTop = Math.max(0, headerBottom) + 16;
    const visibleBottom = Math.min(window.innerHeight, footerTop) - 16;
    const closedHeight = snapshot.panelHeight - snapshot.height;
    const finalHeight = open ? content.getBoundingClientRect().height : 0;
    let targetScroll: number;

    if (open) {
      const lastPossibleTop = Math.max(visibleTop, visibleBottom - closedHeight - finalHeight);
      const targetTop = Math.max(visibleTop, Math.min(snapshot.top, lastPossibleTop));
      targetScroll = Math.max(0, snapshot.scroll + snapshot.top - targetTop);
      returnPosition.current = { before: snapshot.scroll, after: targetScroll };
    } else {
      const previous = returnPosition.current;
      // Restore the opening position only if the student hasn't scrolled elsewhere.
      const preferred = previous && Math.abs(snapshot.scroll - previous.after) < 3
        ? previous.before : snapshot.scroll;
      const documentTop = snapshot.scroll + snapshot.top;
      targetScroll = Math.max(0, Math.min(
        Math.max(preferred, documentTop + closedHeight - visibleBottom),
        documentTop - visibleTop,
      ));
      returnPosition.current = null;
    }

    const root = document.documentElement;
    const previousAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    let frame = 0;
    const started = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanup = () => {
      cancelAnimationFrame(frame);
      root.style.overflowAnchor = previousAnchor;
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", interrupt);
      stop.current = () => {};
    };
    const interrupt = () => {
      returnPosition.current = null;
      cleanup();
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) interrupt();
    };
    const tick = () => {
      const currentHeight = reveal.getBoundingClientRect().height;
      const distance = finalHeight - snapshot.height;
      const done = reducedMotion || Math.abs(currentHeight - finalHeight) < .5 || performance.now() - started > 800;
      const progress = done || Math.abs(distance) < .5 ? 1
        : Math.max(0, Math.min(1, (currentHeight - snapshot.height) / distance));
      window.scrollTo({ top: snapshot.scroll + (targetScroll - snapshot.scroll) * progress, behavior: "instant" });
      if (done) {
        if (open && returnPosition.current) returnPosition.current.after = window.scrollY;
        cleanup();
      } else {
        frame = requestAnimationFrame(tick);
      }
    };
    stop.current = cleanup;
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", interrupt);
    frame = requestAnimationFrame(tick);
    return cleanup;
  }, [open, panelRef, revealRef, contentRef]);

  return prepare;
}
