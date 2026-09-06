import type { MetadataRoute } from "next";

import { SITE } from "@/constants/site";

import { getStoredProgrammes, getStoredEvents, getStoredNews } from "@/lib/cms/store";



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const base = SITE.url;

  const [programmes, events, news] = await Promise.all([

    getStoredProgrammes(),

    getStoredEvents(),

    getStoredNews(),

  ]);



  const staticRoutes = [

    "",

    "/about",

    "/schools",

    "/programmes",

    "/admissions",

    "/news",

    "/events",

    "/branches",

    "/careers",

    "/contact",

    "/privacy",

    "/terms",

  ].map((path) => ({

    url: `${base}${path}`,

    lastModified: new Date(),

    changeFrequency: "weekly" as const,

    priority: path === "" ? 1 : 0.8,

  }));



  const programmeRoutes = programmes

    .filter((p) => p.status === "published")

    .map((p) => ({

      url: `${base}/programmes/${p.slug}`,

      lastModified: new Date(),

      changeFrequency: "monthly" as const,

      priority: p.flagship ? 0.9 : 0.7,

    }));



  const newsRoutes = news

    .filter((n) => n.status === "published")

    .map((n) => ({

      url: `${base}/news/${n.slug}`,

      lastModified: new Date(n.publishedAt),

      changeFrequency: "monthly" as const,

      priority: 0.6,

    }));



  const eventRoutes = events

    .filter((e) => e.status === "published")

    .map((e) => ({

      url: `${base}/events/${e.slug}`,

      lastModified: new Date(e.startAt),

      changeFrequency: "weekly" as const,

      priority: 0.6,

    }));



  return [...staticRoutes, ...programmeRoutes, ...newsRoutes, ...eventRoutes];

}


