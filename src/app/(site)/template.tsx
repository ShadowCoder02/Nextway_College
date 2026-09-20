"use client";

import { useEffect } from "react";
import { m } from "framer-motion";

// Module-level on purpose: a template remounts on every navigation, but the
// module (and this flag) survives for the whole client session. The very
// first render must NOT animate — the SSR HTML is already visible, and
// starting it at opacity 0 would delay LCP on every hard page load.
let hasNavigated = false;

/** Brief (220ms) fade + small slide-up when moving between routes, so
 * client-side navigation doesn't hard-cut. Entrance only: a true exit
 * animation via AnimatePresence in the App Router means freezing Next's
 * internal layout-router context, which isn't a public API and breaks
 * across Next versions. */
export default function Template({ children }: { children: React.ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <m.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
