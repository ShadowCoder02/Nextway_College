"use client";

import { useEffect } from "react";
import "lenis/dist/lenis.css";
import { afterLoad } from "./use-in-view";

/** Lenis smooth scrolling for wheel/trackpad input. Touch scrolling stays
 * native (Lenis's default `syncTouch: false`) — hijacking it on a mid-range
 * Android is what makes smooth-scroll sites feel janky. Skipped entirely for
 * `prefers-reduced-motion`, and the library itself is imported only after
 * the page has loaded so it never competes with critical resources.
 *
 * Renders only its children: Lenis is driven from an effect, never a wrapper,
 * so toggling it never remounts the page tree. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: { destroy: () => void } | null = null;
    let cancelLoad: (() => void) | null = null;

    const stop = () => {
      cancelLoad?.();
      cancelLoad = null;
      lenis?.destroy();
      lenis = null;
    };
    const start = () => {
      stop();
      if (query.matches) return;
      cancelLoad = afterLoad(() => {
        import("lenis").then(({ default: Lenis }) => {
          if (query.matches) return;
          lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true, anchors: true, autoRaf: true });
        });
      });
    };

    start();
    query.addEventListener("change", start);
    return () => {
      query.removeEventListener("change", start);
      stop();
    };
  }, []);

  return <>{children}</>;
}
