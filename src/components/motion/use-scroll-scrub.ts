"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll-linked progress for a section, written straight to the DOM (no React
 * re-render per frame): sets `--p` (0-1) on the root and toggles
 * `data-active` on each `[data-step]` child as progress passes it.
 *
 * The server renders the FINAL state (`--p:1`, every step active), so no-JS
 * and reduced-motion visitors see the complete diagram; this only rewinds it
 * to "not yet reached" when motion is allowed, then plays it forward as the
 * visitor scrolls. Never hijacks scrolling and never delays anything.
 */
export function useScrollScrub(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    let raf = 0;

    const render = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // Short diagrams (the horizontal journey line is ~250px tall) still get a
      // scrub distance of at least ~half a screen, so the drawing is watchable.
      const range = Math.max(rect.height * 0.85, vh * 0.5);
      const p = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / range));
      root.style.setProperty("--p", p.toFixed(3));
      steps.forEach((el, i) => el.setAttribute("data-active", String(p >= (i + 0.5) / steps.length - 0.03)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      root.style.setProperty("--p", "1");
      steps.forEach((el) => el.setAttribute("data-active", "true"));
    };
  }, [ref]);
}
