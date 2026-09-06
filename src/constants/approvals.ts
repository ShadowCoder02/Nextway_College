export interface Approval {
  name: string;
  logo: string;
  /** TODO(content): the college must confirm and describe what each
   * relationship actually is (member, accredited by, affiliate, etc.) —
   * never invent these. */
  description: string;
  verifyUrl?: string;
}

// TODO(content): the college must confirm and describe what each
// relationship actually is (member, accredited by, affiliate, etc.) and
// supply a verifiable URL — see content/TODO-content.md. This placeholder
// is deliberately neutral (states nothing is confirmed yet) rather than an
// invented claim, since it's shown to real visitors, not just developers.
const TODO_DESCRIPTION = "Partnership details to be confirmed.";

export const APPROVALS: Approval[] = [
  { name: "CPD Certified", logo: "/partners/cpd.png", description: TODO_DESCRIPTION },
  { name: "Universidad Azteca", logo: "/partners/azteca.png", description: TODO_DESCRIPTION },
  { name: "International Association of Universities", logo: "/partners/iau.png", description: TODO_DESCRIPTION },
  { name: "UNESCO", logo: "/partners/unesco.png", description: TODO_DESCRIPTION },
  { name: "UGC Recognised", logo: "/partners/ugc.png", description: TODO_DESCRIPTION },
  { name: "International Business Development Forum", logo: "/partners/ibdf.png", description: TODO_DESCRIPTION },
  { name: "Accreditation Partner", logo: "/partners/app.png", description: TODO_DESCRIPTION },
  { name: "Future Focus Welfare Team", logo: "/partners/ffwt.png", description: TODO_DESCRIPTION },
];
