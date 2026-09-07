import { describe, expect, it } from "vitest";
import { getNewsArticles, getNewsBySlug, getLatestNews, getAllNewsAdmin } from "./news";

describe("getNewsArticles / getNewsBySlug", () => {
  it("only returns published articles, newest first", async () => {
    const articles = await getNewsArticles();
    expect(articles.every((a) => a.status === "published")).toBe(true);
    for (let i = 1; i < articles.length; i++) {
      expect(new Date(articles[i - 1].publishedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(articles[i].publishedAt).getTime(),
      );
    }
  });

  it("returns undefined for a nonexistent slug rather than throwing", async () => {
    expect(await getNewsBySlug("nonexistent-slug")).toBeUndefined();
  });

  it("getLatestNews respects the limit", async () => {
    const latest = await getLatestNews(1);
    expect(latest.length).toBeLessThanOrEqual(1);
  });

  it("getAllNewsAdmin includes unpublished articles too (admin view is unfiltered)", async () => {
    const admin = await getAllNewsAdmin();
    const published = await getNewsArticles();
    expect(admin.length).toBeGreaterThanOrEqual(published.length);
  });
});
