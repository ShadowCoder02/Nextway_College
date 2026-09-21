"use client";

import { useEffect } from "react";

// Module-level on purpose: a template remounts on every navigation, but the
// module (and this flag) survives for the whole client session. The very
// first render must NOT animate - the SSR HTML is already visible, and
// starting it at opacity 0 would delay LCP on every hard page load.
let hasNavigated = false;

/** Brief (220ms) fade + small slide-up when moving between routes, so
 * client-side navigation doesn't hard-cut. CSS only (see `.route-enter` in
 * globals.css); entrance only, because a true exit animation in the App Router
 * means freezing Next's private layout-router context. */
export default function Template({ children }: { children: React.ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return <div className={animate ? "route-enter" : undefined}>{children}</div>;
}
