import { NextResponse } from "next/server";
import type { NewsArticle } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredNews, saveNews } from "@/lib/cms/store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as NewsArticle;
  const news = await getStoredNews();
  const idx = news.findIndex((n) => n.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  news[idx] = { ...news[idx], ...body, id };
  await saveNews(news);
  return NextResponse.json({ ok: true, article: news[idx] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const news = await getStoredNews();
  const filtered = news.filter((n) => n.id !== id);
  if (filtered.length === news.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveNews(filtered);
  return NextResponse.json({ ok: true });
}
