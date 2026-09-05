/**
 * Carries the programme slug a visitor picked on /apply through the
 * register -> verify -> login chain, since none of those steps are
 * guaranteed to receive it as a URL query param (a user can navigate away,
 * refresh, or land on /apply/login directly). Callers should still forward
 * ?programme= via the URL where possible; this is the fallback, not the
 * primary channel. Values are only ever matched against the real programme
 * catalogue before use — never rendered directly — so an unexpected value
 * here is inert.
 */
const STORAGE_KEY = "nwc:apply:programme-slug";

export function rememberProgrammeSlug(slug: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // sessionStorage unavailable (privacy mode, disabled storage, etc.)
  }
}

export function readRememberedProgrammeSlug(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearRememberedProgrammeSlug() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
