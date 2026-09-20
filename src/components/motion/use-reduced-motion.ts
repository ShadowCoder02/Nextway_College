"use client";

import { useEffect, useState } from "react";

/** `prefers-reduced-motion`, safe for SSR: always `false` on the server and
 * on the first client render (so hydration matches), then the real value
 * after mount. Framer's own `useReducedMotion()` reads the media query
 * during the first client render and would cause a hydration mismatch for
 * anyone with reduced motion on. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}
