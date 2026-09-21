"use client";

import { useRef } from "react";
import { useScrollScrub } from "./use-scroll-scrub";

type Step = { step: string; title: string; text: string };

/** Discover -> Grow as a timeline whose line draws itself (and highlights each
 * step in turn) as the visitor scrolls through it. Vertical on mobile,
 * horizontal from lg. Static and complete without JS / with reduced motion. */
export function JourneyTimeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useScrollScrub(ref);

  return (
    <ol ref={ref} className="journey relative grid gap-10 lg:grid-cols-5 lg:gap-6" style={{ "--p": 1 } as React.CSSProperties}>
      {/* progress line: vertical (mobile) / horizontal (lg) */}
      <span aria-hidden="true" className="absolute bottom-7 left-7 top-7 w-0.5 -translate-x-1/2 bg-navy/15 lg:hidden">
        <span className="absolute inset-0 origin-top bg-gold" style={{ transform: "scaleY(var(--p))" }} />
      </span>
      <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-7 hidden h-0.5 -translate-y-1/2 bg-navy/15 lg:block">
        <span className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(var(--p))" }} />
      </span>

      {steps.map((s) => (
        <li key={s.step} data-step="" data-active="true" className="journey-step relative flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
          <span className="journey-dot relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold lg:mb-4">
            {s.step}
          </span>
          <div>
            <h3 className="mb-1 text-lg font-bold">{s.title}</h3>
            <p className="text-sm text-slate">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
