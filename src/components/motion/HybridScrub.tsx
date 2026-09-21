"use client";

import { useRef } from "react";
import { useScrollScrub } from "./use-scroll-scrub";

const RING_R = 78;
const RING_C = 2 * Math.PI * RING_R;
const GAP = 6;

/**
 * The site's signature interaction: the 80% online / 20% direct split drawn as
 * a ring that fills as you scroll (online first, then direct) while the four
 * ways of learning below it light up in turn. Meaning never depends on
 * motion: the ring is fully drawn and every item active in the server HTML,
 * for no-JS and reduced-motion visitors, and the split is also stated in text.
 */
export function HybridScrub({ intro, items }: { intro: React.ReactNode; items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollScrub(ref);
  const online = RING_C * 0.8 - GAP;
  const direct = RING_C * 0.2 - GAP;

  return (
    <div ref={ref} className="grid items-center gap-12 lg:grid-cols-2" style={{ "--p": 1 } as React.CSSProperties}>
      <div>
        {intro}
        <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} data-step="" data-active="true" className="hybrid-item flex items-start gap-3 text-white/90">
              <span className="hybrid-check mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <figure className="mx-auto w-full max-w-sm">
        <div className="relative aspect-square">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label="Ring chart: 80% of learning is online, 20% is direct sessions">
            <circle cx="100" cy="100" r={RING_R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="16" />
            <circle
              cx="100"
              cy="100"
              r={RING_R}
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="16"
              strokeLinecap="round"
              style={{ strokeDasharray: `calc(${online} * min(var(--p) * 1.25, 1)) 1000` }}
            />
            <circle
              cx="100"
              cy="100"
              r={RING_R}
              fill="none"
              stroke="var(--color-brand-red)"
              strokeWidth="16"
              strokeLinecap="round"
              style={{
                strokeDasharray: `calc(${direct} * min(max(var(--p) - 0.8, 0) * 5, 1)) 1000`,
                strokeDashoffset: -(RING_C * 0.8),
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-heading text-5xl font-semibold text-white">80/20</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">online / direct</span>
          </div>
        </div>
        <figcaption className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-gold" aria-hidden="true" />
            <span className="text-white/85">
              <strong className="block text-white">80% online</strong>
              Study from anywhere in Sri Lanka
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
            <span className="text-white/85">
              <strong className="block text-white">20% direct</strong>
              Labs, workshops and assessments
            </span>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
