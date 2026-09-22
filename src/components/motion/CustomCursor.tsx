"use client";

import { useEffect, useRef } from "react";

const RING_LERP = 0.22;
const HOVER_SELECTOR = 'a, button, [role="button"], .card-choreo, summary';
const TEXT_SELECTOR = "input, textarea, select, [contenteditable]";

/**
 * Two-part custom cursor: a small dot that tracks the pointer exactly, and a
 * larger ring that eases toward it (rAF + lerp, not React state, so this
 * costs nothing per frame beyond direct style writes). The ring scales up
 * over links/buttons/cards and hides over text fields so native text-editing
 * affordance (the I-beam) still shows through there.
 *
 * Desktop-only (fine pointer + real hover) and off for reduced motion — on
 * a touch device or with motion reduced this never mounts, the native
 * cursor is untouched, and nothing else on the page depends on it.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor-active");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      show();
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    const onLeaveWindow = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(TEXT_SELECTOR)) {
        ring.dataset.state = "text";
      } else if (target?.closest(HOVER_SELECTOR)) {
        ring.dataset.state = "hover";
      } else {
        ring.dataset.state = "";
      }
    };

    const tick = () => {
      rx += (x - rx) * RING_LERP;
      ry += (y - ry) * RING_LERP;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden="true" className="custom-cursor-dot" />
      <div ref={ringRef} aria-hidden="true" className="custom-cursor-ring" />
    </>
  );
}
