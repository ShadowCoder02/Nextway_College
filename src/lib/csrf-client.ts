import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-constants";

/** Reads the CSRF cookie middleware.ts sets on every response and echoes it
 * back as a header — see middleware.ts for the double-submit verification. */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function csrfHeaders(extra: HeadersInit = {}): HeadersInit {
  return { ...extra, [CSRF_HEADER_NAME]: getCsrfToken() };
}
