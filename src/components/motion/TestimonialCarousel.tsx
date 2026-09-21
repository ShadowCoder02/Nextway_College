"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { PresentedTestimonial } from "@/lib/testimonials";

export type CarouselTestimonial = PresentedTestimonial;

const SWIPE_PX = 50;

function Quote({ t }: { t: CarouselTestimonial }) {
  return (
    <>
      <p className="text-lg leading-relaxed text-charcoal sm:text-xl">{t.quote}</p>
      <footer className="mt-6 flex items-center gap-4">
        {t.photoUrl ? (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40">
            <Image src={t.photoUrl} alt="" fill className="object-cover" sizes="56px" />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-semibold text-gold"
          >
            {t.initials}
          </span>
        )}
        <div>
          <cite className="font-bold not-italic text-navy">{t.name}</cite>
          <p className="text-sm text-slate">
            {t.programme}
            {t.cohort ? ` · ${t.cohort}` : ""}
          </p>
        </div>
      </footer>
    </>
  );
}

/** Manual testimonial carousel: arrows, dots, arrow-keys and swipe/drag. It
 * never moves on its own (no perpetual motion), and the slide/quote-mark
 * animations are CSS-only and switch off for reduced motion. */
export function TestimonialCarousel({ testimonials }: { testimonials: CarouselTestimonial[] }) {
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  // undefined until the first interaction, so the initial render is static.
  const [dir, setDir] = useState<"next" | "prev" | undefined>();
  const dragStart = useRef<number | null>(null);

  const go = (delta: number) => {
    setDir(delta > 0 ? "next" : "prev");
    setIndex((i) => (i + delta + count) % count);
  };
  const goTo = (target: number) => {
    setDir(target >= index ? "next" : "prev");
    setIndex(target);
  };

  const current = testimonials[index];
  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition hover:border-brand-red hover:text-brand-red";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Student testimonials"
      className="mx-auto max-w-3xl"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="premium-card relative overflow-hidden p-8 sm:p-12">
        <div className="grid">
          {/* Invisible copies of every slide share one grid cell so the card
              is always as tall as the longest quote - no layout shift when the
              slide changes. */}
          {testimonials.map((t) => (
            <div key={t.id} aria-hidden="true" className="invisible col-start-1 row-start-1 select-none pt-14">
              <Quote t={t} />
            </div>
          ))}
          <div
            key={current.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-live="polite"
            data-dir={dir}
            className="carousel-slide col-start-1 row-start-1 cursor-grab touch-pan-y active:cursor-grabbing"
            onPointerDown={(e) => {
              dragStart.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (dragStart.current === null || count < 2) return;
              const dx = e.clientX - dragStart.current;
              dragStart.current = null;
              if (dx <= -SWIPE_PX) go(1);
              else if (dx >= SWIPE_PX) go(-1);
            }}
            onPointerCancel={() => {
              dragStart.current = null;
            }}
          >
            <blockquote>
              <span aria-hidden="true" className="quote-glyph mb-3 block h-11 font-heading text-6xl leading-none text-gold">
                &ldquo;
              </span>
              <Quote t={current} />
            </blockquote>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" className={btn} onClick={() => go(-1)} aria-label="Previous testimonial">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show testimonial ${i + 1} of ${count}`}
                aria-current={i === index}
                className="flex h-11 w-6 items-center justify-center"
              >
                <span className={`block h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-brand-red" : "w-2 bg-navy/25"}`} />
              </button>
            ))}
          </div>
          <button type="button" className={btn} onClick={() => go(1)} aria-label="Next testimonial">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
