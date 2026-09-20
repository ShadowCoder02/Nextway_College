"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "./use-in-view";

const DURATION_MS = 1400;

// Ease-out expo: fast start, long soft landing.
const easeOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Counts every number inside `value` up from 0 when scrolled into view
 * ("80/20" -> both 80 and 20, "10+" -> 10 then the "+"). The final text is
 * in the SSR HTML and in an sr-only span, so no-JS visitors, crawlers and
 * screen readers always get the real value; the visible digits sit in the
 * same grid cell as an invisible copy of the final text so the width never
 * shifts while counting. */
export function AnimatedCounter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, rootMargin: "0px 0px -10% 0px" });
  const parts = value.split(/(\d+)/);
  const [progress, setProgress] = useState(1);
  const [armed, setArmed] = useState(false);
  // globals.css hides `.js [data-counter]` until this is set, so the final
  // SSR digits never flash before the count-up resets them to zero.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(0);
      setArmed(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!armed || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setProgress(easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, inView]);

  const shown = parts
    .map((part, i) => (i % 2 === 1 ? String(Math.round(Number(part) * progress)) : part))
    .join("");

  return (
    <>
      <span ref={ref} data-counter data-ready={ready || undefined} className={className} style={{ display: "inline-grid", fontVariantNumeric: "tabular-nums" }} aria-hidden="true">
        <span style={{ gridArea: "1 / 1", visibility: "hidden" }}>{value}</span>
        <span style={{ gridArea: "1 / 1" }}>{shown}</span>
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
