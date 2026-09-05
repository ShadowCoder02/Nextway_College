export const SITE = {
  name: "Nextway College International",
  shortName: "Nextway College International",
  tagline: "Learn Today. Lead Tomorrow.",
  supportingLine:
    "Premium hybrid higher education — 80% online and 20% direct classes across Sri Lanka.",
  description:
    "Nextway College International delivers degree, diploma and certificate programmes through a modern hybrid model with English and Tamil medium classes, serving learners across 22 branches island-wide.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
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
