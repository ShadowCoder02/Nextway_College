/** Server-side validation for the few query-string values the apply pages
 * read. Anything that doesn't match is dropped (never echoed, never trusted). */
type Raw = string | string[] | undefined;
const first = (v: Raw) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** A programme slug: lowercase letters, digits and hyphens only. */
export function slugParam(v: Raw): string | undefined {
  const s = first(v);
  return s && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 100 ? s : undefined;
}

/** A 6-digit verification code. */
export function otpParam(v: Raw): string | undefined {
  const s = first(v);
  return s && /^\d{6}$/.test(s) ? s : undefined;
}

/** A plausible email address (format only; the API does the real validation). */
export function emailParam(v: Raw): string | undefined {
  const s = first(v);
  return s && s.length <= 254 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(s) ? s : undefined;
}

/** A URL-safe reset token (as issued by generateSecureToken). */
export function tokenParam(v: Raw): string | undefined {
  const s = first(v);
  return s && /^[A-Za-z0-9_-]{16,200}$/.test(s) ? s : undefined;
}
