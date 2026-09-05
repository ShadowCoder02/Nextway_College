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
  studyModel: "80% online · 20% direct (hybrid)",
  mediums: ["English", "Tamil"],
  // TODO(content): these were bare domain roots (facebook.com, not a real
  // page), not real profile links, so they render as broken/generic
  // footer links. Left empty until the college supplies real profile
  // URLs — Footer only renders a key with a non-empty value.
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programmes", label: "Programmes" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "News & Events" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

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

export const BRANCHES = [
  "Kandy",
  "Colombo",
  "Galle",
  "Batticaloa",
  "Kegalle",
  "Kurunegala",
  "Kalutara",
] as const;
