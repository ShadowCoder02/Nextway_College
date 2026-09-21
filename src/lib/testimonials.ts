import type { Testimonial } from "@/types";
import { clientValue } from "@/lib/client-input";

export type PresentedTestimonial = {
  id: string;
  quote: string;
  name: string;
  programme: string;
  cohort?: string;
  photoUrl?: string;
  initials: string;
};

/** Only real, consented data reaches the page: placeholder tokens are dropped,
 * and a photo is shown only when photo consent is explicitly confirmed. */
export function presentTestimonial(t: Testimonial): PresentedTestimonial {
  const first = clientValue(t.firstName);
  const last = clientValue(t.lastName);
  const name = [first, last].filter(Boolean).join(" ") || t.studentName;
  const photo = t.photoConsentConfirmed ? clientValue(t.imageUrl) : undefined;
  return {
    id: t.id,
    quote: t.quote,
    name,
    programme: t.programme,
    cohort: clientValue(t.cohort),
    photoUrl: photo,
    initials: name
      .replace(/[^\p{L}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => Array.from(w)[0]?.toUpperCase() ?? "")
      .join(""),
  };
}

export function publishedTestimonials(all: Testimonial[]): PresentedTestimonial[] {
  return all.filter((t) => t.status === "published" && t.consentConfirmed).map(presentTestimonial);
}
