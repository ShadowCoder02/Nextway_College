"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * While `active`: moves focus into the container, keeps Tab/Shift+Tab inside
 * it, calls `onEscape` on Escape, and returns focus to the element that
 * opened it when it closes. (`returnTo` overrides that element.)
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  { onEscape, returnTo, initialFocus }: { onEscape: () => void; returnTo?: RefObject<HTMLElement | null>; initialFocus?: RefObject<HTMLElement | null> },
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const opener = (returnTo?.current ?? (document.activeElement as HTMLElement | null)) ?? null;

    (initialFocus?.current ?? container.querySelector<HTMLElement>(FOCUSABLE))?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !container.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !container.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
    // onEscape intentionally excluded: callers pass an inline closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
