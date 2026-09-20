"use client";

import { m, type Variants } from "framer-motion";

// Spec: translateY ~24px, opacity 0 -> 1, ~400ms ease-out, once, triggered
// slightly before the element is fully in view.
const VIEWPORT = { once: true, margin: "-100px" } as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** seconds */
  delay?: number;
};

/** Fade + slide-up for a single block as it scrolls into view. The
 * `data-reveal` hook lets globals.css force it visible for reduced-motion
 * users and no-JS visitors (SSR markup starts at opacity 0). */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <m.div
      data-reveal
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: itemVariants.hidden,
        show: { ...(itemVariants.show as object), transition: { duration: 0.4, ease: "easeOut", delay } },
      }}
    >
      {children}
    </m.div>
  );
}

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  /** seconds between children */
  stagger?: number;
};

/** Container that staggers its <RevealItem> children into view. */
export function RevealGroup({ children, className, stagger = 0.08 }: RevealGroupProps) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div data-reveal className={className} variants={itemVariants}>
      {children}
    </m.div>
  );
}
