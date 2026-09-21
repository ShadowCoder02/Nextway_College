import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { IMAGES } from "@/constants/images";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { formatDate } from "@/lib/utils";
import { getNewsArticles } from "@/services/news";
import { getUpcomingEvents } from "@/services/events";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = buildMetadata({
  title: "News & Events",
  description: "Latest news and upcoming events at Nextway College International.",
  path: "/news",
});

export default async function NewsPage() {
  const [articles, events] = await Promise.all([getNewsArticles(), getUpcomingEvents(4)]);

  return (
    <>
      <Breadcrumbs items={[{ label: "News & Events", href: "/news" }]} />
      <PageHero eyebrow="Updates" title="News & Events" />

      <section className="py-16 lg:py-24">
        <div className="container-nwc">
          <h2 className="text-section mb-8">Latest news</h2>
          <RevealGroup className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <RevealItem key={article.id} className="h-full">
              <article className="premium-card card-choreo group h-full overflow-hidden">
                <div className="relative aspect-16/10 overflow-hidden">
                  <FallbackImage
                    src={article.coverImageUrl}
                    fallbackSrc={IMAGES.campus}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                </div>
                <div className="p-6">
                  <p className="mb-2 text-sm text-gold-text">{formatDate(article.publishedAt)} · {article.category}</p>
                  <h3 className="mb-2 text-xl font-bold">
                    <Link href={`/news/${article.slug}`} className="hover:text-deep-blue">
                      {article.title}
                      <span aria-hidden="true" className="ml-1 inline-block text-brand-red transition-transform duration-300 group-hover:translate-x-1.5 group-focus-within:translate-x-1.5">→</span>
                    </Link>
                  </h3>
                  <p className="text-slate">{article.excerpt}</p>
                </div>
              </article>
              </RevealItem>
            ))}
          </RevealGroup>

          <h2 className="text-section mb-8 mt-16">Upcoming events</h2>
          {events.length === 0 ? (
            <EmptyState heading="No upcoming events are scheduled right now" body="Check back soon." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article key={event.id} className="rounded-[var(--radius-card)] bg-ice p-6">
                  <p className="mb-1 text-sm font-medium text-deep-blue">{formatDate(event.startAt)}</p>
                  <h3 className="mb-2 text-xl font-bold">
                    <Link href={`/events/${event.slug}`} className="hover:text-deep-blue">
                      {event.title}
                    </Link>
                  </h3>
                  <p className="text-slate">{event.summary}</p>
                </article>
              ))}
            </div>
          )}
          <Link href="/events" className="mt-6 inline-block font-semibold text-deep-blue hover:text-gold-text">
            View all events →
          </Link>
        </div>
      </section>
    </>
  );
}
