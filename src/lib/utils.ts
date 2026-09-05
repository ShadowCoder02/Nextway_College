import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// The single date-formatting module referenced by CLAUDE.md: every rendered
// date/time on the site must go through here, pinned to Asia/Colombo. The
// Vercel server runs UTC and the client runs its own device-local zone, so
// without an explicit timeZone the same timestamp renders differently on
// each — the 9:00 AM Kandy Open Day showed as 3:30 AM — and can hydration-
// mismatch when they disagree.
const COLOMBO_TIME_ZONE = "Asia/Colombo";

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: COLOMBO_TIME_ZONE,
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: COLOMBO_TIME_ZONE,
  }).format(new Date(dateStr));
}

export function whatsappUrl(number: string, message?: string) {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
