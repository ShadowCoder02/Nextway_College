import { describe, expect, it } from "vitest";
import { presentTestimonial } from "./testimonials";
import { needsInput } from "./client-input";
import type { Testimonial } from "@/types";

const base: Testimonial = { id: "t", studentName: "A. Fernando", programme: "Diploma", quote: "q", status: "published", consentConfirmed: true };

describe("presentTestimonial", () => {
  it("drops placeholder tokens and never shows a photo without photo consent", () => {
    const t = presentTestimonial({ ...base, firstName: needsInput("x"), cohort: needsInput("y"), imageUrl: "/x.jpg", photoConsentConfirmed: false });
    expect(t.name).toBe("A. Fernando");
    expect(t.cohort).toBeUndefined();
    expect(t.photoUrl).toBeUndefined();
    expect(t.initials).toBe("AF");
  });
  it("uses real name, cohort and consented photo when supplied", () => {
    const t = presentTestimonial({ ...base, firstName: "Amal", lastName: "Fernando", cohort: "Graduated 2025", imageUrl: "/x.jpg", photoConsentConfirmed: true });
    expect(t).toMatchObject({ name: "Amal Fernando", cohort: "Graduated 2025", photoUrl: "/x.jpg" });
  });
});
