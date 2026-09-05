/**
 * Requests every remote image URL referenced by the CMS data files and
 * reports which ones don't resolve. Run with: npx tsx scripts/check-images.ts
 */
import { promises as fs } from "fs";
import path from "path";

const DATA_FILES = [
  "data/cms/programmes.json",
  "data/cms/events.json",
  "data/cms/news.json",
];

type Reference = { url: string; file: string; label: string };

function collectImageUrls(file: string, json: unknown): Reference[] {
  const refs: Reference[] = [];
  const records = Array.isArray(json) ? json : [];
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const label =
      (record as { slug?: string; title?: string; id?: string }).slug ??
      (record as { title?: string }).title ??
      (record as { id?: string }).id ??
      "unknown";
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === "string" && /^https?:\/\//.test(value) && /image|logo|photo/i.test(key)) {
        refs.push({ url: value, file, label: String(label) });
      }
    }
  }
  return refs;
}

async function checkUrl(url: string): Promise<number | "error"> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return res.status;
  } catch {
    return "error";
  }
}

async function main() {
  const root = process.cwd();
  const allRefs: Reference[] = [];

  for (const relPath of DATA_FILES) {
    const filePath = path.join(root, relPath);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      allRefs.push(...collectImageUrls(relPath, JSON.parse(raw)));
    } catch {
      console.warn(`Skipping ${relPath} — could not read/parse it.`);
    }
  }

  const uniqueUrls = [...new Set(allRefs.map((r) => r.url))];
  console.log(`Checking ${uniqueUrls.length} unique image URL(s) across ${DATA_FILES.length} data file(s)...\n`);

  const results = await Promise.all(
    uniqueUrls.map(async (url) => ({ url, status: await checkUrl(url) })),
  );

  const failures = results.filter((r) => r.status === "error" || r.status >= 400);

  for (const result of results) {
    const referencedBy = allRefs.filter((r) => r.url === result.url).map((r) => `${r.file}:${r.label}`);
    const flag = result.status === "error" || (typeof result.status === "number" && result.status >= 400) ? "FAIL" : "ok";
    console.log(`[${flag}] ${result.status}  ${result.url}\n       referenced by: ${referencedBy.join(", ")}`);
  }

  console.log(`\n${failures.length} of ${uniqueUrls.length} image URL(s) failed.`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
