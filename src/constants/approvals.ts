import { clientValue, needsInput } from "@/lib/client-input";

export interface Approval {
  name: string;
  logo: string;
  /** What the relationship actually is (member, accredited by, affiliate,
   * etc.). Never invent this — leave the NEEDS CLIENT INPUT token until the
   * college supplies real, specific text. */
  description?: string;
  /** A URL where a visitor can verify the relationship. */
  verifyUrl?: string;
  /** Renders the logo in a larger box — for marks that read as too small
   * (relative to the other partner logos) at the strip's default size. */
  large?: boolean;
}

/**
 * A logo on its own implies an endorsement. Until the college supplies a real,
 * specific description for a partner, that partner is NOT shown publicly.
 * Flip to `true` only if the college explicitly accepts showing unverified
 * logos (not recommended for UNESCO / UGC / IAU / CPD marks).
 */
export const SHOW_UNVERIFIED_APPROVALS = false;

const pending = (name: string) =>
  needsInput(`one-line description of the specific relationship with ${name} (member / accredited by / affiliate / …) and a URL that verifies it`);

const ALL_APPROVALS: Approval[] = [
  { name: "CPD Certified", logo: "/partners/cpd.png", description: pending("CPD Certified"), verifyUrl: pending("CPD Certified") },
  { name: "Universidad Azteca", logo: "/partners/azteca.png", description: pending("Universidad Azteca"), verifyUrl: pending("Universidad Azteca") },
  { name: "International Association of Universities", logo: "/partners/iau.png", description: pending("the International Association of Universities"), verifyUrl: pending("the International Association of Universities") },
  { name: "UNESCO", logo: "/partners/unesco.png", description: pending("UNESCO"), verifyUrl: pending("UNESCO") },
  { name: "UGC Recognised", logo: "/partners/ugc.png", description: pending("the University Grants Commission"), verifyUrl: pending("the University Grants Commission") },
  { name: "International Business Development Forum", logo: "/partners/ibdf.png", description: pending("the International Business Development Forum"), verifyUrl: pending("the International Business Development Forum") },
  { name: "Accreditation Partner", logo: "/partners/app.png", description: pending("this accreditation partner (real name + relationship)"), verifyUrl: pending("this accreditation partner"), large: true },
  { name: "Future Focus Welfare Team", logo: "/partners/ffwt.png", description: pending("Future Focus Welfare Team"), verifyUrl: pending("Future Focus Welfare Team"), large: true },
];

/** Partners that may be shown publicly, with placeholder tokens stripped. */
export function getPublicApprovals(): Approval[] {
  return ALL_APPROVALS.filter((a) => SHOW_UNVERIFIED_APPROVALS || clientValue(a.description)).map((a) => ({
    ...a,
    description: clientValue(a.description),
    verifyUrl: clientValue(a.verifyUrl),
  }));
}
