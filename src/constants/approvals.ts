export interface Approval {
  name: string;
  logo: string;
  /** TODO(content): the college must confirm and describe what each
   * relationship actually is (member, accredited by, affiliate, etc.) —
   * never invent these. Optional: when omitted, ApprovalsStrip shows just
   * the logo and name, so nothing unverified is implied. */
  description?: string;
  verifyUrl?: string;
  /** Renders the logo in a larger box — for marks that read as too small
   * (relative to the other partner logos) at the strip's default size. */
  large?: boolean;
}

// TODO(content): the college must confirm and describe what each
// relationship actually is (member, accredited by, affiliate, etc.) and
// supply a verifiable URL — see content/TODO-content.md. Until then no
// description is shown (rather than a visible "to be confirmed" line, or
// an invented claim) — add `description` / `verifyUrl` per entry below
// once real copy exists.
export const APPROVALS: Approval[] = [
  { name: "CPD Certified", logo: "/partners/cpd.png" },
  { name: "Universidad Azteca", logo: "/partners/azteca.png" },
  { name: "International Association of Universities", logo: "/partners/iau.png" },
  { name: "UNESCO", logo: "/partners/unesco.png" },
  { name: "UGC Recognised", logo: "/partners/ugc.png" },
  { name: "International Business Development Forum", logo: "/partners/ibdf.png" },
  { name: "Accreditation Partner", logo: "/partners/app.png", large: true },
  { name: "Future Focus Welfare Team", logo: "/partners/ffwt.png", large: true },
] as const;
