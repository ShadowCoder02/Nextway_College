"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveals as progressive enhancement. The server renders everything
 * visible; on mount, only elements that are still below the fold are marked
 * `pending` (translated 12px, transparent) and flipped to `in` when they
 * scroll into view — once. If JS never runs, nothing is ever hidden; if the
 * observer somehow never fires, a CSS failsafe reveals after 3s; reduced-motion
 * users get the final state immediately (all in globals.css).
 */
function useRevealOnce<T extends HTMLElement>(attr: "data-reveal" | "data-reveal-group") {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load: leave it alone (no flash, no animation).
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;

    el.setAttribute(attr, "pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute(attr, "in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [attr]);
  return ref;
}

/** Fade + 12px slide-up (500ms) for a single block as it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; /** seconds */ delay?: number }) {
  const ref = useRevealOnce<HTMLDivElement>("data-reveal");
  return (
    <div ref={ref} className={className} style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}

/** Reveals its <RevealItem> children in sequence (70ms apart, see globals.css). */
export function RevealGroup({ children, className }: { children: React.ReactNode; className?: string; /** kept for API compatibility; spacing is fixed at 70ms */ stagger?: number }) {
  const ref = useRevealOnce<HTMLDivElement>("data-reveal-group");
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-reveal-item="" className={cn(className)}>
      {children}
    </div>
  );
}
