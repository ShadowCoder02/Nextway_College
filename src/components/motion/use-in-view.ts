"use client";

import { useEffect, useState, type RefObject } from "react";

/** Minimal IntersectionObserver hook — used instead of Framer's `useInView`
 * so the homepage's first-load JS doesn't pull in Framer's viewport code. */
export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", once = false }: { rootMargin?: string; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}

/** Runs `fn` once the page has finished loading (and the browser is idle),
 * so animation code never competes with the hero image / critical JS for
 * bandwidth on a slow connection. */
export function afterLoad(fn: () => void): () => void {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => !cancelled && fn(), { timeout: 2500 });
    else setTimeout(() => !cancelled && fn(), 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
  };
}
