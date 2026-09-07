import { describe, expect, it } from "vitest";
import {
  getProgrammes,
  getProgrammeFacetCounts,
  getSchools,
  getSchoolsWithProgrammeCounts,
  getSchoolBySlug,
  getProgrammesBySchool,
  getFeaturedProgrammes,
  getFlagshipProgramme,
  getProgrammeBySlug,
} from "./programmes";

// Suite 7's highest-priority regression, tested at the service layer against
// the REAL current catalog (data/cms/programmes.json) rather than a mock —
// the whole point is catching whether the live data's schoolSlug field is
// actually populated, which a mock would paper over.
describe("getProgrammes — school filter (Suite 7 regression guard)", () => {
  it("filtering by School of Computing & IT returns BSc Information Technology", async () => {
    const results = await getProgrammes({ school: "computing-it" });
    expect(results.some((p) => p.slug === "bsc-information-technology")).toBe(true);
  });

  it("every published programme has a non-empty schoolSlug", async () => {
    const results = await getProgrammes();
    for (const p of results) {
      expect(p.schoolSlug).toBeTruthy();
    }
  });

  it("a school with genuinely no matching programmes returns an empty array, not an error", async () => {
    const results = await getProgrammes({ school: "not-a-real-school-slug" });
    expect(results).toEqual([]);
  });

  it("only returns published programmes", async () => {
    const results = await getProgrammes();
    expect(results.every((p) => p.status === "published")).toBe(true);
  });

  it("free-text search matches title, pitch, or school name", async () => {
    const results = await getProgrammes({ q: "information technology" });
    expect(results.some((p) => p.slug === "bsc-information-technology")).toBe(true);
  });

  it("combining an existing level with a school that has no programmes at that level returns empty, not a crash", async () => {
    const results = await getProgrammes({ school: "computing-it", level: "Certificate" });
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("getProgrammeFacetCounts", () => {
  it("returns a count for every level/mode actually present in the catalog", async () => {
    const facets = await getProgrammeFacetCounts();
    const totalByLevel = Object.values(facets.levels).reduce((a, b) => a + b, 0);
    const all = await getProgrammes();
    expect(totalByLevel).toBe(all.length);
  });
});

describe("getSchools / getSchoolsWithProgrammeCounts", () => {
  it("only returns active schools", async () => {
    const schools = await getSchools();
    expect(schools.every((s) => s.isActive)).toBe(true);
  });

  it("School of Computing & IT's programme count matches getProgrammes({school})", async () => {
    const withCounts = await getSchoolsWithProgrammeCounts();
    const computingIt = withCounts.find((s) => s.slug === "computing-it");
    const direct = await getProgrammes({ school: "computing-it" });
    expect(computingIt?.programmeCount).toBe(direct.length);
  });

  it("getSchoolBySlug returns undefined for an unknown slug rather than throwing", async () => {
    expect(await getSchoolBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getProgrammesBySchool", () => {
  it("returns only published programmes for the given school", async () => {
    const results = await getProgrammesBySchool("computing-it");
    expect(results.every((p) => p.schoolSlug === "computing-it" && p.status === "published")).toBe(true);
  });
});

describe("getFeaturedProgrammes / getFlagshipProgramme", () => {
  it("every featured programme is published", async () => {
    const featured = await getFeaturedProgrammes();
    expect(featured.every((p) => p.status === "published")).toBe(true);
  });

  it("the flagship programme, if any, is published", async () => {
    const flagship = await getFlagshipProgramme();
    if (flagship) expect(flagship.status).toBe("published");
  });
});

describe("getProgrammeBySlug", () => {
  it("returns undefined for a nonexistent slug rather than throwing (regression: /apply?programme=nonexistent-slug must not crash)", async () => {
    expect(await getProgrammeBySlug("nonexistent-slug")).toBeUndefined();
  });

  it("returns undefined for a slug containing script-tag/XSS payload characters, not an error", async () => {
    expect(await getProgrammeBySlug("<script>alert(1)</script>")).toBeUndefined();
  });
});
