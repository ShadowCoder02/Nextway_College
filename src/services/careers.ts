import { getStoredCareers } from "@/lib/cms/store";
import type { CareerVacancy } from "@/types";

export async function getCareers(): Promise<CareerVacancy[]> {
  return (await getStoredCareers())
    .filter((c) => c.status === "published")
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

export async function getCareerBySlug(slug: string): Promise<CareerVacancy | undefined> {
  return (await getStoredCareers()).find((c) => c.slug === slug && c.status === "published");
}

export async function getAllCareersAdmin(): Promise<CareerVacancy[]> {
  return getStoredCareers();
}
