"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// The animation engine is fetched only after `window.load` + idle, never in
// the initial chunk or alongside the LCP image: `m.*` elements render their
// SSR markup without it, and anything that animates on scroll sits below the
// fold. (Reduced-motion/no-JS visitors are covered by globals.css.)
const loadFeatures = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") return;
    const run = () =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => resolve(), { timeout: 2500 })
        : setTimeout(resolve, 200);
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  }).then(() => import("./motion-features").then((mod) => mod.default));

/** Site-wide Framer Motion setup: lazy feature loading, and
 * `reducedMotion="user"` so transform/layout animations are skipped for
 * anyone with the OS "reduce motion" setting on. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
