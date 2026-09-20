"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, m, type PanInfo } from "framer-motion";
import { useInView } from "./use-in-view";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// Drag needs the larger feature bundle. It is only requested once the
// carousel is near the viewport (see `dragGate` below), so it never loads for
// visitors who don't scroll that far. Until it arrives the carousel already
// works via the arrows/dots and autoplay.

export type CarouselTestimonial = {
  id: string;
  quote: string;
  studentName: string;
  programme: string;
};

const AUTOPLAY_MS = 7000;
const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 400;

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
};

function Quote({ t }: { t: CarouselTestimonial }) {
  return (
    <>
      <p className="text-lg leading-relaxed text-charcoal sm:text-xl">{t.quote}</p>
      <footer className="mt-6">
        <cite className="font-bold not-italic text-navy">{t.studentName}</cite>
        <p className="text-sm text-slate">{t.programme}</p>
      </footer>
    </>
  );
}

export function TestimonialCarousel({ testimonials }: { testimonials: CarouselTestimonial[] }) {
  const reduced = usePrefersReducedMotion();
  const count = testimonials.length;
  const [[index, direction], setPage] = useState<[number, number]>([0, 1]);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const visible = useInView(rootRef, { rootMargin: "0px 0px -20% 0px" });
  const nearViewport = useInView(rootRef, { rootMargin: "400px 0px", once: true });
  const dragGate = useMemo(() => {
    let open!: () => void;
    const opened = new Promise<void>((resolve) => {
      open = resolve;
    });
    return { opened, open };
  }, []);
  const loadDragFeatures = useCallback(
    () => dragGate.opened.then(() => import("./motion-features-max")).then((mod) => mod.default),
    [dragGate],
  );
  useEffect(() => {
    if (nearViewport) dragGate.open();
  }, [nearViewport, dragGate]);

  const go = useCallback(
    (dir: number) => setPage(([i]) => [(i + dir + count) % count, dir]),
    [count],
  );
  const goTo = (target: number) => setPage(([i]) => [target, target >= i ? 1 : -1]);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Auto-rotation never runs for reduced-motion users, and pauses when scrolled
  // out of view, on hover, keyboard focus, drag, a hidden tab, or the visible pause button.
  const autoplay = playing && visible && !reduced && !hovering && !focused && !dragging && !tabHidden && count > 1;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay, index, go]);

  function onDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    setDragging(false);
    if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }

  const current = testimonials[index];
  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition hover:border-brand-red hover:text-brand-red focus-visible:outline-2";

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Student testimonials"
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <LazyMotion features={loadDragFeatures} strict>
        <div className="premium-card relative overflow-hidden p-8 sm:p-12">
          <div className="grid">
            {/* Invisible copies of every slide share one grid cell so the card
                is always as tall as the longest quote — no layout shift when
                the slide changes on its own. */}
            {testimonials.map((t) => (
              <div key={t.id} aria-hidden="true" className="invisible col-start-1 row-start-1 select-none pt-14">
                <Quote t={t} />
              </div>
            ))}
            <div className="col-start-1 row-start-1">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <m.blockquote
                  key={current.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}`}
                  aria-live={autoplay ? "off" : "polite"}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragStart={() => setDragging(true)}
                  onDragEnd={onDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <m.span
                    key={`q-${current.id}`}
                    aria-hidden="true"
                    className="mb-3 block h-11 font-heading text-6xl leading-none text-gold"
                    initial={reduced ? false : { opacity: 0, scale: 0.4, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    &ldquo;
                  </m.span>
                  <Quote t={current} />
                </m.blockquote>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </LazyMotion>

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
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-brand-red" : "w-2 bg-navy/25"
                  }`}
                />
              </button>
            ))}
          </div>
          <button type="button" className={btn} onClick={() => go(1)} aria-label="Next testimonial">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!reduced && (
            <button
              type="button"
              className={btn}
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause automatic rotation" : "Resume automatic rotation"}
              aria-pressed={!playing}
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
