/**
 * Marker for content only the college can supply. The token lives in source
 * or data (greppable: `grep -rn "NEEDS CLIENT INPUT" src content`), and every
 * renderer must pass values through `clientValue()` so the token itself is
 * never shown to a visitor — an unverified claim is replaced by a neutral
 * fallback (or nothing), not by "{{NEEDS CLIENT INPUT}}" on a live page.
 */
const PREFIX = "{{NEEDS CLIENT INPUT";

/** Build a token, e.g. needsInput("real photo of the student"). */
export function needsInput(what: string): string {
  return `${PREFIX}: ${what}}}`;
}

export function needsClientInput(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trimStart().startsWith(PREFIX);
}

/** The value if it is real content; `undefined` if empty or a placeholder token. */
export function clientValue(value: string | null | undefined): string | undefined {
  if (!value || !value.trim() || needsClientInput(value)) return undefined;
  return value;
}
