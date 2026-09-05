/** Reads the CSRF cookie middleware.ts sets on every response and echoes it
 * back as a header — see middleware.ts for the double-submit verification. */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function csrfHeaders(extra: HeadersInit = {}): HeadersInit {
  return { ...extra, "x-csrf-token": getCsrfToken() };
}
