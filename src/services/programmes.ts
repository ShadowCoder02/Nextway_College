import type { Programme, ProgrammeLevel, School, StudyMode } from "@/types";
import {
  getStoredProgrammes,
  isSupabaseConfigured,
} from "@/lib/cms/store";
import { schools as staticSchools } from "@/data/content";

export type ProgrammeFilters = {
  q?: string;
  level?: ProgrammeLevel;
  mode?: StudyMode;
  school?: string;
};

async function loadProgrammes(): Promise<import("@/types").Programme[]> {
  return getStoredProgrammes();
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

  return results;
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

export async function getSchoolBySlug(slug: string): Promise<School | undefined> {
  return staticSchools.find((s) => s.slug === slug && s.isActive);
}

export async function getProgrammesBySchool(schoolSlug: string): Promise<Programme[]> {
  return (await loadProgrammes()).filter(
    (p) => p.schoolSlug === schoolSlug && p.status === "published",
  );
}

export { isSupabaseConfigured };
