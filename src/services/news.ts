import { getStoredNews } from "@/lib/cms/store";
import type { NewsArticle } from "@/types";

export async function getNewsArticles(): Promise<NewsArticle[]> {
  return (await getStoredNews())
    .filter((n) => n.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return (await getStoredNews()).find((n) => n.slug === slug && n.status === "published");
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  const articles = await getNewsArticles();
  return articles.slice(0, limit);
}

export async function getAllNewsAdmin(): Promise<NewsArticle[]> {
  return getStoredNews();
}
