import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata, newsArticleJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { HERO_BLUR_PLACEHOLDER } from "@/constants/images";
import { getNewsBySlug } from "@/services/news";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { getStoredNews } = await import("@/lib/cms/store");
  const news = await getStoredNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    image: article.coverImageUrl,
    type: "article",
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            newsArticleJsonLd({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              publishedAt: article.publishedAt,
              coverImageUrl: article.coverImageUrl,
            }),
          ),
        }}
      />
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc max-w-3xl">
          <p className="mb-3 text-sm text-gold">{formatDate(article.publishedAt)} · {article.category}</p>
          <h1 className="text-display text-white">{article.title}</h1>
        </div>
      </section>
      <div className="container-nwc max-w-3xl py-12">
        <Breadcrumbs
          items={[{ label: "News & Events", href: "/news" }, { label: article.title, href: `/news/${article.slug}` }]}
          visible
          className="mb-8"
        />
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={HERO_BLUR_PLACEHOLDER}
          />
        </div>
        <div className="prose prose-lg max-w-none text-charcoal">
          <p>{article.content}</p>
        </div>
      </div>
    </article>
  );
}
