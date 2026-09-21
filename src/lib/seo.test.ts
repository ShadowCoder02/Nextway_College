import { describe, expect, it } from "vitest";
import { courseJsonLd, eventJsonLd, isoDuration } from "./seo";

describe("isoDuration", () => {
  it("converts plain quantities to ISO 8601", () => {
    expect(isoDuration("3 years")).toBe("P3Y");
    expect(isoDuration("1 year")).toBe("P1Y");
    expect(isoDuration("18 months")).toBe("P18M");
    expect(isoDuration("2 years 6 months")).toBe("P2Y6M");
    expect(isoDuration("1.5 years")).toBe("P18M");
    expect(isoDuration("12 weeks")).toBe("P12W");
  });
  it("returns undefined for anything that isn't a plain quantity", () => {
    expect(isoDuration("As per programme structure")).toBeUndefined();
    expect(isoDuration("")).toBeUndefined();
  });
});

describe("courseJsonLd", () => {
  const base = { title: "T", description: "d", slug: "t", level: "Degree" };
  it("only states duration/mode it can state accurately", () => {
    const ok = courseJsonLd({ ...base, duration: "3 years", mode: "Hybrid" }).hasCourseInstance;
    expect(ok).toMatchObject({ duration: "P3Y", courseMode: "Blended" });
    expect(courseJsonLd({ ...base, duration: "As per programme structure", mode: "Flexible" })).not.toHaveProperty("hasCourseInstance");
  });
});

describe("eventJsonLd attendance mode", () => {
  const ev = { title: "t", description: "d", slug: "s", startAt: "2026-09-12T09:00:00+05:30", imageUrl: "/x.jpg" };
  it("treats online + campus as mixed, campus-only as offline", () => {
    expect(eventJsonLd({ ...ev, location: "Online / Campus hybrid" }).eventAttendanceMode).toContain("Mixed");
    expect(eventJsonLd({ ...ev, location: "Kandy Campus" }).eventAttendanceMode).toContain("Offline");
    expect(eventJsonLd({ ...ev, location: "Online (Zoom)" }).eventAttendanceMode).toContain("Online");
  });
});
