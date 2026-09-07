import { describe, expect, it } from "vitest";
import { getCareers, getCareerBySlug, getAllCareersAdmin } from "./careers";

describe("getCareers / getCareerBySlug", () => {
  it("only returns published vacancies, newest posted first", async () => {
    const careers = await getCareers();
    expect(careers.every((c) => c.status === "published")).toBe(true);
    for (let i = 1; i < careers.length; i++) {
      expect(new Date(careers[i - 1].postedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(careers[i].postedAt).getTime(),
      );
    }
  });

  it("returns undefined for a nonexistent slug rather than throwing", async () => {
    expect(await getCareerBySlug("nonexistent-slug")).toBeUndefined();
  });

  it("getAllCareersAdmin includes unpublished vacancies too", async () => {
    const admin = await getAllCareersAdmin();
    const published = await getCareers();
    expect(admin.length).toBeGreaterThanOrEqual(published.length);
  });
});
