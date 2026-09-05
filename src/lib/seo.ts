import type { Metadata } from "next";
import { SITE } from "@/constants/site";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description = SITE.description,
  path = "",
  image,
  type = "website",
}: SeoInput = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE.shortName}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.url}${path}`;

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
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
      images: [{ url: image ?? SITE.logo }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image ?? SITE.logo],
    },
  };
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
    ...(Object.values(SITE.social).some(Boolean)
      ? { sameAs: Object.values(SITE.social).filter(Boolean) }
      : {}),
  };
}

export function courseJsonLd(programme: {
  title: string;
  description: string;
  slug: string;
  duration: string;
  level: string;
}) {
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
    timeRequired: programme.duration,
    educationalLevel: programme.level,
  };
}
