"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/constants/site";

const MIN_VISIBLE_MS = 480;
const FADE_OUT_MS = 250;
const SAFETY_TIMEOUT_MS = 2500;

type Phase = "idle" | "in" | "out";

/**
 * A brief branded moment at the exact point a visitor commits to applying:
 * any same-origin click into /apply* shows this full-screen overlay
 * immediately (the click's own <Link> navigation is never intercepted or
 * delayed — this is purely decorative on top of it), then fades out once
 * the destination route has actually painted.
 *
 * Never shown for prefers-reduced-motion: those visitors get the site's
 * normal (already accessible) 220ms route fade instead of an extra
 * full-screen visual event. Pure progressive enhancement — with no JS this
 * component never mounts and /apply links behave as plain navigation.
 */
export function PortalHandoff() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const shownAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
  }

  // Once the destination route has actually painted, hold for the minimum
  // visible time, then fade out, then unmount.
  useEffect(() => {
    if (phase !== "in") return;
    const elapsed = Date.now() - shownAt.current;
    clearTimer();
    timer.current = setTimeout(() => setPhase("out"), Math.max(0, MIN_VISIBLE_MS - elapsed));
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(() => setPhase("idle"), FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Not checking e.defaultPrevented: Next's <Link> calls preventDefault()
      // via React's own root-level listener, which runs before this plain
      // document listener (React attaches its delegated listener at render
      // time, well before this effect runs) — by the time we see the event,
      // defaultPrevented is already true for every normal Link click.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const link = (e.target as Element | null)?.closest("a[href]");
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.getAttribute("href") || "", window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/apply") || url.pathname === pathname) return;

      shownAt.current = Date.now();
      setPhase("in");
      clearTimer();
      timer.current = setTimeout(() => setPhase("out"), SAFETY_TIMEOUT_MS);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div className={`portal-handoff${phase === "out" ? " portal-handoff-out" : ""}`} role="status" aria-live="polite">
      <span className="sr-only">Loading the applicant portal…</span>
      <div className="portal-handoff-mark">
        <span className="portal-handoff-ring" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny, decorative, shown for well under a second; not worth next/image's srcset machinery */}
        <img src={SITE.logoIcon} alt="" aria-hidden="true" className="portal-handoff-logo" />
      </div>
    </div>
  );
}
