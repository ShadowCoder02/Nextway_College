"use client";

// Reference-counted so overlapping overlays (e.g. search dialog opened from
// the mobile menu) don't unlock the page early.
let locks = 0;
export const SCROLL_LOCK_EVENT = "nwc:scroll-lock";

function apply(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  // Lenis drives window scroll programmatically, which `overflow:hidden`
  // alone does not stop — SmoothScroll listens for this and pauses it.
  window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: { locked } }));
}

export function lockScroll() {
  if (locks++ === 0) apply(true);
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) apply(false);
}
