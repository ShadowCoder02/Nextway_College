/**
 * Just the threshold, in its own zero-dependency module — same reasoning as
 * cookie-names.ts and csrf-constants.ts. turnstile.ts's verification
 * functions reference process.env.TURNSTILE_SECRET_KEY (server-only); client
 * pages that need this threshold to decide when to render the widget
 * shouldn't import that module at all.
 */
export const TURNSTILE_AFTER_ATTEMPTS = 3;
