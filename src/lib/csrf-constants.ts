/**
 * Just the two name constants, in their own zero-dependency module — same
 * reasoning as src/lib/admissions/cookie-names.ts. middleware.ts (Edge
 * runtime) and csrf-client.ts (browser bundle) both need these, but neither
 * should import the other's file: middleware.ts pulls in Node-only/Edge-only
 * server code, and a client bundle must never import from it.
 */
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";
