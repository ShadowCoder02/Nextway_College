/**
 * Just the cookie name constant, in its own zero-dependency module.
 * middleware.ts (Edge runtime) needs this name but must never import
 * session.ts itself, which pulls in Node-only fs/path via admissions-store.ts
 * for the sessionVersion lookup — that import chain breaks the Edge bundle.
 */
export const APPLICANT_COOKIE = "nwc_applicant_session";
