"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/** Drives `apply(scrollY)` from a passive scroll listener, throttled to one
 * write per animation frame. Plain DOM writes — no Framer scroll machinery —
 * keeps the homepage's first-load JS small. */
function useScrollEffect(apply: (y: number) => void, disabled: boolean, reset: () => void) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const resetRef = useRef(reset);
  resetRef.current = reset;

  useEffect(() => {
    if (disabled) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      applyRef.current(window.scrollY);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      resetRef.current();
    };
  }, [disabled]);
}

/** Wraps the hero's background image. Moves at 0.3x the scroll distance so it
 * drifts slower than the content. The box is extended upward (see the
 * page's `-top-[30%]`) so the translation never exposes an edge. */
export function HeroBackdrop({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useScrollEffect(
    (scrollY) => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(0, ${Math.min(scrollY, 1000) * 0.3}px, 0)`;
    },
    reduced,
    () => {
      if (ref.current) ref.current.style.transform = "";
    },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Fades the headline/subtext slightly (and lifts it a touch) as the visitor
 * scrolls past the hero. */
export function HeroContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useScrollEffect(
    (scrollY) => {
      const el = ref.current;
      if (!el) return;
      const p = Math.min(scrollY / 480, 1);
      el.style.opacity = String(1 - 0.85 * p);
      el.style.transform = `translate3d(0, ${-32 * p}px, 0)`;
    },
    reduced,
    () => {
      if (ref.current) {
        ref.current.style.opacity = "";
        ref.current.style.transform = "";
      }
    },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
