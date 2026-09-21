import { PROGRAMME_LEVELS, STUDY_MODES } from "@/constants/site";
import type { ProgrammeFilters, ProgrammeSort } from "@/services/programmes";

/** Fixed enums every /programmes query parameter is checked against. Anything
 * else is dropped server-side and never echoed back into the page. */
export const MEDIUM_FILTERS = ["English", "Tamil"] as const;
export const PROGRAMME_SORTS: readonly ProgrammeSort[] = ["featured", "title-asc", "title-desc"];

type RawParams = Record<string, string | string[] | undefined>;
export type KnownFilterValues = { schools: readonly string[]; intakes: readonly string[] };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Free-text search: keeps letters (any script, incl. Tamil/Sinhala marks),
 * digits, spaces and a little punctuation; drops everything else (angle
 * brackets, quotes, control characters…); caps the length. */
export function sanitizeSearchText(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const cleaned = input
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\p{N}\s.,&'()/+#-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  return cleaned || undefined;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => a === value);
}

export type ParsedProgrammeQuery = {
  filters: ProgrammeFilters;
  /** True when a filter parameter was present with a value that isn't in its
   * enum — the page redirects to the clean URL so the bad value is dropped. */
  hadInvalid: boolean;
};

export function parseProgrammeFilters(raw: RawParams, known: KnownFilterValues): ParsedProgrammeQuery {
  const rawValue = (k: string) => first(raw[k])?.trim() || undefined;

  const level = oneOf(rawValue("level"), PROGRAMME_LEVELS);
  const mode = oneOf(rawValue("mode"), STUDY_MODES);
  const medium = oneOf(rawValue("medium"), MEDIUM_FILTERS);
  const school = oneOf(rawValue("school"), known.schools);
  const intake = oneOf(rawValue("intake"), known.intakes);
  const sort = oneOf(rawValue("sort"), PROGRAMME_SORTS);
  const q = sanitizeSearchText(first(raw.q));

  const hadInvalid =
    (rawValue("level") !== undefined && !level) ||
    (rawValue("mode") !== undefined && !mode) ||
    (rawValue("medium") !== undefined && !medium) ||
    (rawValue("school") !== undefined && !school) ||
    (rawValue("intake") !== undefined && !intake) ||
    (rawValue("sort") !== undefined && !sort);

  return { filters: { q, level, mode, medium, school, intake, sort: sort === "featured" ? undefined : sort }, hadInvalid };
}

/** Canonical /programmes URL for a filter set (stable param order). */
export function programmesHref(filters: ProgrammeFilters, without?: keyof ProgrammeFilters): string {
  const params = new URLSearchParams();
  for (const key of ["q", "level", "school", "mode", "medium", "intake", "sort"] as const) {
    const value = filters[key];
    if (value && key !== without) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/programmes?${qs}` : "/programmes";
}
