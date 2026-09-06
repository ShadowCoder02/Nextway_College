import type { Programme, ProgrammeLevel, School, StudyMode } from "@/types";
import {
  getStoredProgrammes,
  isSupabaseConfigured,
} from "@/lib/cms/store";
import { schools as staticSchools } from "@/data/content";

export type ProgrammeSort = "featured" | "title-asc" | "title-desc";

export type ProgrammeFilters = {
  q?: string;
  level?: ProgrammeLevel;
  mode?: StudyMode;
  school?: string;
  sort?: ProgrammeSort;
};

async function loadProgrammes(): Promise<import("@/types").Programme[]> {
  return getStoredProgrammes();
}

function sortProgrammes(programmes: Programme[], sort: ProgrammeSort): Programme[] {
  const sorted = [...programmes];
  if (sort === "title-asc") return sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "title-desc") return sorted.sort((a, b) => b.title.localeCompare(a.title));
  // "featured" (default): flagship first, then featured, then alphabetical.
  return sorted.sort((a, b) => {
    const scoreA = (a.flagship ? 2 : 0) + (a.featured ? 1 : 0);
    const scoreB = (b.flagship ? 2 : 0) + (b.featured ? 1 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.title.localeCompare(b.title);
  });
}

export async function getProgrammes(filters?: ProgrammeFilters): Promise<Programme[]> {
  let results = (await loadProgrammes()).filter((p) => p.status === "published");

  if (filters?.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortPitch.toLowerCase().includes(q) ||
        p.schoolName.toLowerCase().includes(q),
    );
  }

  if (filters?.level) results = results.filter((p) => p.level === filters.level);
  if (filters?.mode) results = results.filter((p) => p.mode === filters.mode);
  if (filters?.school) results = results.filter((p) => p.schoolSlug === filters.school);

  return sortProgrammes(results, filters?.sort ?? "featured");
}

/** Live per-option counts for the level/mode filter dropdowns, computed
 * against all published programmes (not cross-filtered by other active
 * filters) — same convention as getSchoolsWithProgrammeCounts below. */
export async function getProgrammeFacetCounts(): Promise<{
  levels: Record<string, number>;
  modes: Record<string, number>;
}> {
  const programmes = await getProgrammes();
  const levels: Record<string, number> = {};
  const modes: Record<string, number> = {};
  for (const p of programmes) {
    levels[p.level] = (levels[p.level] ?? 0) + 1;
    modes[p.mode] = (modes[p.mode] ?? 0) + 1;
  }
  return { levels, modes };
}

export async function getAllProgrammesAdmin(): Promise<Programme[]> {
  return loadProgrammes();
}

export async function getProgrammeBySlug(slug: string): Promise<Programme | undefined> {
  return (await loadProgrammes()).find((p) => p.slug === slug && p.status === "published");
}

export async function getProgrammeById(id: string): Promise<Programme | undefined> {
  return (await loadProgrammes()).find((p) => p.id === id);
}

export async function getFeaturedProgrammes(): Promise<Programme[]> {
  return (await loadProgrammes()).filter((p) => p.featured && p.status === "published");
}

export async function getFlagshipProgramme(): Promise<Programme | undefined> {
  return (await loadProgrammes()).find((p) => p.flagship && p.status === "published");
}

export async function getSchools(): Promise<School[]> {
  return staticSchools.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSchoolsWithProgrammeCounts(): Promise<
  (School & { programmeCount: number })[]
> {
  const [schools, programmes] = await Promise.all([getSchools(), getProgrammes()]);
  return schools.map((school) => ({
    ...school,
    programmeCount: programmes.filter((p) => p.schoolSlug === school.slug).length,
  }));
}

export async function getSchoolBySlug(slug: string): Promise<School | undefined> {
  return staticSchools.find((s) => s.slug === slug && s.isActive);
}

export async function getProgrammesBySchool(schoolSlug: string): Promise<Programme[]> {
  return (await loadProgrammes()).filter(
    (p) => p.schoolSlug === schoolSlug && p.status === "published",
  );
}

export { isSupabaseConfigured };
