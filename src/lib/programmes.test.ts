import { describe, expect, it } from "vitest";
import { parseProgrammeFilters, programmesHref, sanitizeSearchText } from "./programmes";

const known = { schools: ["computing-it", "law"], intakes: ["2026 Intake"] };

describe("parseProgrammeFilters (whitelist)", () => {
  it("accepts only values from the fixed enums", () => {
    const { filters, hadInvalid } = parseProgrammeFilters({ level: "Degree", mode: "Hybrid", medium: "Tamil", school: "law", intake: "2026 Intake", sort: "title-asc" }, known);
    expect(filters).toMatchObject({ level: "Degree", mode: "Hybrid", medium: "Tamil", school: "law", intake: "2026 Intake", sort: "title-asc" });
    expect(hadInvalid).toBe(false);
  });
  it("drops script/SQL-style values instead of passing them through, and flags them for redirect", () => {
    const { filters, hadInvalid } = parseProgrammeFilters({ level: "<script>alert(1)</script>", school: "1' OR 1=1--", mode: "x", medium: "French", intake: "1999", sort: "drop" }, known);
    expect(filters).toEqual({ q: undefined, level: undefined, mode: undefined, medium: undefined, school: undefined, intake: undefined, sort: undefined });
    expect(hadInvalid).toBe(true);
  });
  it("takes the first value of a repeated parameter and ignores unknown parameters", () => {
    const { filters, hadInvalid } = parseProgrammeFilters({ level: ["Diploma", "Degree"], utm_source: "x", other: "y" }, known);
    expect(filters.level).toBe("Diploma");
    expect(hadInvalid).toBe(false);
  });
});

describe("sanitizeSearchText", () => {
  it("strips markup characters, collapses whitespace and caps length", () => {
    expect(sanitizeSearchText("  <script>alert(1)</script>  IT ")).toBe("script alert(1) /script IT");
    expect(sanitizeSearchText("x".repeat(200))?.length).toBe(80);
    expect(sanitizeSearchText("   ")).toBeUndefined();
  });
  it("keeps Tamil and Sinhala text intact", () => {
    expect(sanitizeSearchText("நித்தர்சன் සමන්")).toBe("நித்தர்சன் සමන්");
  });
});

describe("programmesHref", () => {
  it("builds a stable canonical URL and can omit one key", () => {
    expect(programmesHref({ level: "Degree", q: "law" })).toBe("/programmes?q=law&level=Degree");
    expect(programmesHref({ level: "Degree", q: "law" }, "q")).toBe("/programmes?level=Degree");
    expect(programmesHref({})).toBe("/programmes");
  });
});
