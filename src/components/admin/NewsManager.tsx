"use client";

import { useEffect, useState } from "react";
import type { NewsArticle } from "@/types";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-fetch";

const emptyArticle = (): NewsArticle => ({
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  publishedAt: new Date().toISOString().slice(0, 10),
  category: "General",
  status: "published",
});

export function NewsManager() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await apiFetch("/api/portal/news");
    const data = await res.json();
    setNews(data.news ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    const payload = { ...editing };

    if (editing.id && news.some((n) => n.id === editing.id)) {
      await apiFetch(`/api/portal/news/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch("/api/portal/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this news article?")) return;
    await apiFetch(`/api/portal/news/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate">Loading news...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">News</h1>
          <p className="text-slate">Add, edit or remove news articles shown on the website.</p>
        </div>
        <Button variant="primary" onClick={() => setEditing(emptyArticle())}>
          Add article
        </Button>
      </div>

      {editing && (
        <div className="premium-card space-y-4 p-6">
          <h2 className="text-lg font-bold">{editing.id ? "Edit article" : "New article"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Title
              <input
                className="input-premium mt-1"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Category
              <input
                className="input-premium mt-1"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Excerpt
              <textarea
                className="input-premium mt-1 min-h-20"
                value={editing.excerpt}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Content
              <textarea
                className="input-premium mt-1 min-h-32"
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Cover image URL
              <input
                className="input-premium mt-1"
                value={editing.coverImageUrl}
                onChange={(e) => setEditing({ ...editing, coverImageUrl: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Published date
              <input
                type="date"
                className="input-premium mt-1"
                value={editing.publishedAt.slice(0, 10)}
                onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Status
              <select
                className="input-premium mt-1"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as NewsArticle["status"] })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={save}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="premium-card overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-ice text-slate">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map((article) => (
              <tr key={article.id} className="border-b border-ice">
                <td className="px-4 py-3 font-medium">{article.title}</td>
                <td className="px-4 py-3">{article.category}</td>
                <td className="px-4 py-3">{article.publishedAt.slice(0, 10)}</td>
                <td className="px-4 py-3 capitalize">{article.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-red"
                      onClick={() => setEditing(article)}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-error" onClick={() => remove(article.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
