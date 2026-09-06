import type { ProgrammeLevel, StudyMode } from "@/types";
import type { ProgrammeFilters, ProgrammeSort } from "@/services/programmes";

const VALID_SORTS: ProgrammeSort[] = ["featured", "title-asc", "title-desc"];

export function parseProgrammeFilters(searchParams: {
  q?: string;
  level?: string;
  mode?: string;
  school?: string;
  sort?: string;
}): ProgrammeFilters {
  return {
    q: searchParams.q,
    level: searchParams.level as ProgrammeLevel | undefined,
    mode: searchParams.mode as StudyMode | undefined,
    school: searchParams.school,
    sort: VALID_SORTS.includes(searchParams.sort as ProgrammeSort)
      ? (searchParams.sort as ProgrammeSort)
      : undefined,
  };
}
