import { NextResponse } from "next/server";
import type { NewsArticle } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredNews, saveNews } from "@/lib/cms/store";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const news = await getStoredNews();
  return NextResponse.json({ news });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as NewsArticle;
  const news = await getStoredNews();
  const slug =
    body.slug ||
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const article: NewsArticle = {
    ...body,
    id: body.id || `news-${crypto.randomUUID().slice(0, 8)}`,
    slug,
    status: body.status || "published",
  };
  news.unshift(article);
  await saveNews(news);
  return NextResponse.json({ ok: true, article });
}
