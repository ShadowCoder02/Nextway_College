import { BRANCHES as BRANCH_DIRECTORY } from "@/data/branches";
import { needsInput } from "@/lib/client-input";

function resolveSiteUrl(): string {
  // Vercel sets VERCEL_ENV to "production" | "preview" | "development" on
  // every deployment; NODE_ENV alone can't distinguish a production deploy
  // from a preview one, since both run `next build` with NODE_ENV=production.
  if (process.env.VERCEL_ENV === "production") {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is not set in the Production environment on Vercel. " +
          "Every canonical URL, Open Graph tag, robots.txt and sitemap entry depends " +
          "on it — refusing to build with a localhost fallback in production."
      );
    }
    return url;
  }

  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export const SITE = {
  name: "Nextway College International",
  shortName: "Nextway College International",
  tagline: "Learn Today. Lead Tomorrow.",
  supportingLine:
    "Premium hybrid higher education — 80% online and 20% direct classes across Sri Lanka.",
  description:
    "Nextway College International delivers degree, diploma and certificate programmes through a modern hybrid model with English and Tamil medium classes, serving learners across 22 branches island-wide.",
  url: resolveSiteUrl(),
  locale: "en_LK",
  location: "Kandy, Sri Lanka",
  address: "Kandy, Sri Lanka, 208000",
  phone: "0812 201 650",
  phoneTel: "+94812201650",
  whatsapp: "94742509424",
  whatsappDisplay: "+94 74 250 9424",
  email: "nextwaycollege@gmail.com",
  logo: "/brand/logo-icon.png",
  logoFull: "/brand/logo-icon.png",
  logoIcon: "/brand/logo-icon.png",
  /** 1200x630 default social-share image (Open Graph / Twitter card). */
  ogImage: "/images/og-default.jpg",
  studyModel: "80% online · 20% direct (hybrid)",
  mediums: ["English", "Tamil"],
  // Real profile URLs only. Footer renders a network only when its value is
  // real (see clientValue) — a dead social icon is a trust red flag, so the
  // token stays here until the college supplies the actual page URL.
  social: {
    facebook: needsInput("URL of the college's real Facebook page"),
    instagram: needsInput("URL of the college's real Instagram profile"),
    linkedin: needsInput("URL of the college's real LinkedIn page"),
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/schools", label: "Schools" },
  { href: "/programmes", label: "Programmes" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export type PrimaryNavItem =
  | { label: string; href: string }
  | { label: string; children: { label: string; href: string; description: string }[] };

/** Header navigation. Schools / Programmes / Admissions are grouped under
 * "Study"; the flat NAV_LINKS above stays for the footer. "Home" is the logo. */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Study",
    children: [
      { label: "Programmes", href: "/programmes", description: "Browse, filter and compare every programme" },
      { label: "Schools", href: "/schools", description: "Our academic schools and what they teach" },
      { label: "Admissions", href: "/admissions", description: "Entry requirements and how to apply" },
      { label: "Student life", href: "/student-life", description: "Support, community and campus life" },
      { label: "Find a branch", href: "/branches", description: "Branch locations and contact details" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Events", href: "/events" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export const PROGRAMME_LEVELS = [
  "Degree",
  "Higher Diploma",
  "Diploma",
  "Certificate",
  "Training",
] as const;

export const STUDY_MODES = ["Hybrid", "Online", "Direct", "Flexible"] as const;

export const PORTAL_NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/enquiries", label: "Enquiries" },
  { href: "/portal/programmes", label: "Programmes" },
  { href: "/portal/news", label: "News" },
  { href: "/portal/events", label: "Events" },
  { href: "/portal/careers", label: "Careers" },
] as const;

/** @deprecated use PORTAL_NAV */
export const ADMIN_NAV = PORTAL_NAV;

// Derived from data/branches.ts's Branch[] (the richer, single source of
// truth for branch names) so this list can't silently drift out of sync
// with the /branches directory as the college's full branch list grows.
export const BRANCHES = BRANCH_DIRECTORY.map((b) => b.name);
