"use client";

import { useEffect, useRef } from "react";

const MAX_PX = 8;
const PULL = 0.25;

/** Desktop-only "magnetic" pull: the wrapped call to action drifts a few
 * pixels toward the cursor while it is over it, and settles back on leave.
 * Fine pointer + hover only (never touch), off for reduced motion, capped at
 * 8px so it can't cause misclicks, and it never blocks the click itself. */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * PULL;
      const dy = (e.clientY - (r.top + r.height / 2)) * PULL;
      const clamp = (v: number) => Math.max(-MAX_PX, Math.min(MAX_PX, v));
      el.style.transform = `translate3d(${clamp(dx)}px, ${clamp(dy)}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <span ref={ref} className={`inline-block transition-transform duration-200 ease-out ${className ?? ""}`}>
      {children}
    </span>
  );
}
