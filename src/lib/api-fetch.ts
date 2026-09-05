import { csrfHeaders } from "@/lib/csrf-client";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * fetch() wrapper that attaches the CSRF header (see middleware.ts) on
 * mutating requests. Safe to use everywhere in place of fetch() — GET/HEAD
 * requests pass through unchanged.
 */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  if (!MUTATING_METHODS.has(method)) return fetch(input, init);
  return fetch(input, { ...init, headers: csrfHeaders(init.headers) });
}
