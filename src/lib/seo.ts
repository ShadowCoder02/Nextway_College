import { clientValue } from "@/lib/client-input";
import type { Metadata } from "next";
import { SITE } from "@/constants/site";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  /** Auth/portal/private pages: no public value in indexing, and some carry
   * personal application data. Set true rather than omitting metadata. */
  noindex?: boolean;
};

export function buildMetadata({
  title,
  description = SITE.description,
  path = "",
  image,
  type = "website",
  noindex = false,
}: SeoInput = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE.shortName}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.url}${path}`;

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    icons: {
      icon: SITE.logo,
      apple: SITE.logo,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: image ? [{ url: image }] : [{ url: SITE.ogImage, width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image ?? SITE.ogImage],
    },
  };
}

// Programme/event/news image fields can be either already-absolute
// (Unsplash, Supabase) or a root-relative local path (/images/...) — the
// latter must be resolved against SITE.url before going into JSON-LD, since
// schema.org (and Google's Rich Results parser) requires an absolute URL.
// og:image gets this for free from Next's metadataBase; JSON-LD doesn't.
function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE.url}${url}`;
}

function socialProfiles(): string[] {
  return Object.values(SITE.social)
    .map((url) => clientValue(url))
    .filter((url): url is string => Boolean(url));
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "KANDY SRI LANKA",
      addressLocality: "Kandy",
      addressRegion: "Central Province",
      postalCode: "208000",
      addressCountry: "LK",
    },
    telephone: SITE.phoneTel,
    email: SITE.email,
    // Omit the key entirely while no real profile URLs exist, rather than
    // publishing structured data pointing at bare domain roots.
    ...(socialProfiles().length > 0 ? { sameAs: socialProfiles() } : {}),
  };
}

/** "3 years" -> "P3Y", "18 months" -> "P18M", "2 years 6 months" -> "P2Y6M".
 * schema.org needs an ISO 8601 duration; anything that isn't a plain
 * quantity (e.g. "As per programme structure") returns undefined so the
 * property is omitted rather than published inaccurately. */
export function isoDuration(text: string): string | undefined {
  const units: Record<string, string> = { year: "Y", yr: "Y", month: "M", week: "W", day: "D" };
  const parts = [...text.toLowerCase().matchAll(/(\d+(?:\.\d+)?)\s*(year|yr|month|week|day)s?\b/g)];
  if (parts.length === 0) return undefined;
  const totals: Record<string, number> = {};
  for (const [, qty, unit] of parts) {
    let n = Number(qty);
    let u = units[unit];
    if (u === "Y" && !Number.isInteger(n)) {
      n = Math.round(n * 12);
      u = "M";
    }
    if (!Number.isInteger(n)) return undefined;
    totals[u] = (totals[u] ?? 0) + n;
  }
  const order = ["Y", "M", "W", "D"] as const;
  return "P" + order.filter((u) => totals[u]).map((u) => `${totals[u]}${u}`).join("");
}

const COURSE_MODE: Record<string, string> = { Hybrid: "Blended", Online: "Online", Direct: "Onsite" };

export function courseJsonLd(programme: {
  title: string;
  description: string;
  slug: string;
  duration: string;
  level: string;
  mode: string;
}) {
  const duration = isoDuration(programme.duration);
  const courseMode = COURSE_MODE[programme.mode];
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: programme.title,
    description: programme.description,
    url: `${SITE.url}/programmes/${programme.slug}`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
    educationalLevel: programme.level,
    // Only properties we can state accurately: an unparseable duration or an
    // unmapped study mode is left out instead of guessed.
    ...(duration || courseMode
      ? { hasCourseInstance: { "@type": "CourseInstance", ...(courseMode ? { courseMode } : {}), ...(duration ? { duration } : {}) } }
      : {}),
  };
}

/** Location text like "Online / Campus hybrid" is mixed attendance, not offline. */
function attendanceMode(location: string): string {
  const online = /\bonline\b|\bvirtual\b|\bzoom\b/i.test(location);
  const inPerson = /campus|hall|branch|kandy|colombo|room|in[- ]person|hybrid/i.test(location);
  if (online && inPerson) return "https://schema.org/MixedEventAttendanceMode";
  if (online) return "https://schema.org/OnlineEventAttendanceMode";
  return "https://schema.org/OfflineEventAttendanceMode";
}

export function eventJsonLd(event: {
  title: string;
  description: string;
  slug: string;
  startAt: string;
  location: string;
  imageUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    url: `${SITE.url}/events/${event.slug}`,
    // Stored (and rendered) with an explicit +05:30 offset — pass it through
    // unmodified, never reformat via a UTC-dropping date helper.
    startDate: event.startAt,
    location: {
      "@type": "Place",
      name: event.location,
      address: SITE.location,
    },
    image: absoluteUrl(event.imageUrl),
    organizer: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
    eventAttendanceMode: attendanceMode(event.location),
    eventStatus: "https://schema.org/EventScheduled",
  };
}

export function newsArticleJsonLd(article: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  coverImageUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    url: `${SITE.url}/news/${article.slug}`,
    datePublished: article.publishedAt,
    image: absoluteUrl(article.coverImageUrl),
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}${SITE.logo}` },
    },
  };
}

// schema.org's employmentType enum is a fixed vocabulary; free-text vacancy
// "type" values from the CMS are mapped to the closest match rather than
// passed through raw, and simply omitted (not guessed) when no match fits.
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  fulltime: "FULL_TIME",
  "part-time": "PART_TIME",
  parttime: "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  temporary: "TEMPORARY",
  intern: "INTERN",
  internship: "INTERN",
  volunteer: "VOLUNTEER",
};

export function jobPostingJsonLd(vacancy: {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  department: string;
  location: string;
  type: string;
  postedAt: string;
}) {
  const employmentType = EMPLOYMENT_TYPE_MAP[vacancy.type.trim().toLowerCase()];
  const description =
    vacancy.requirements.length > 0
      ? `${vacancy.description} Requirements: ${vacancy.requirements.join("; ")}.`
      : vacancy.description;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: SITE.name,
      value: vacancy.id,
    },
    datePosted: vacancy.postedAt,
    hiringOrganization: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}${SITE.logo}`,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: vacancy.location, addressCountry: "LK" },
    },
    ...(employmentType ? { employmentType } : {}),
  };
}

export type BreadcrumbItem = { label: string; href: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE.url}${item.href}`,
    })),
  };
}
