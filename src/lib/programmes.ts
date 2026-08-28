import type { ProgrammeLevel, StudyMode } from "@/types";
import type { ProgrammeFilters } from "@/services/programmes";

export function parseProgrammeFilters(searchParams: {
  q?: string;
  level?: string;
  mode?: string;
  school?: string;
}): ProgrammeFilters {
  return {
    q: searchParams.q,
    level: searchParams.level as ProgrammeLevel | undefined,
    mode: searchParams.mode as StudyMode | undefined,
    school: searchParams.school,
  };
}
