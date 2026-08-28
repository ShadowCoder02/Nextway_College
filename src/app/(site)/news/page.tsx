import Link from "next/link";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { IMAGES } from "@/constants/images";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getNewsArticles } from "@/services/news";
import { getEvents } from "@/services/events";

export const metadata = buildMetadata({
  title: "News & Events",
  description: "Latest news and upcoming events at Nextway College International.",
  path: "/news",
});

export default async function NewsPage() {
  const [articles, events] = await Promise.all([getNewsArticles(), getEvents()]);

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc">
          <span className="eyebrow mb-3 block">Updates</span>
          <h1 className="text-display text-white">News & Events</h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc">
          <h2 className="text-section mb-8">Latest news</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
                <div className="relative aspect-16/10">
                  <FallbackImage
                    src={article.coverImageUrl}
                    fallbackSrc={IMAGES.campus}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
                <div className="p-6">
                  <p className="mb-2 text-sm text-gold">{formatDate(article.publishedAt)} · {article.category}</p>
                  <h3 className="mb-2 text-xl font-bold">
                    <Link href={`/news/${article.slug}`} className="hover:text-deep-blue">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-slate">{article.excerpt}</p>
                </div>
              </article>
            ))}
          </div>

          <h2 className="text-section mb-8 mt-16">Upcoming events</h2>
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
          <Link href="/events" className="mt-6 inline-block font-semibold text-deep-blue hover:text-gold">
            View all events →
          </Link>
        </div>
      </section>
    </>
  );
}
