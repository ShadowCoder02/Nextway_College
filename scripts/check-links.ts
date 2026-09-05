/**
 * Crawls the site starting from "/", following internal links, and checks
 * every internal route and every external link it finds for a non-2xx/3xx
 * response.
 *
 * Requires a running server (start with `npm run build && npm run start`,
 * or `npm run dev` for a quicker but slower-to-compile check) at BASE_URL.
 *
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/check-links.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Routes that require an authenticated session — visiting them logged out
// redirects by design, which isn't a broken link. Crawled for outbound
// links but not treated as a failure if they redirect.
const AUTH_GATED_PREFIXES = ["/apply/portal", "/portal", "/admin"];

type LinkResult = { url: string; status: number | "error"; foundOn: string[] };

function extractHrefs(html: string): string[] {
  const hrefs = new Set<string>();
  const regex = /href=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    hrefs.add(match[1]);
  }
  return [...hrefs];
}

function isSkippable(href: string): boolean {
  return (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:") ||
    href.startsWith("#") ||
    href.startsWith("data:")
  );
}

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith(BASE_URL);
}

function toAbsolute(href: string): string {
  return href.startsWith("/") ? `${BASE_URL}${href}` : href;
}

function isAuthGated(pathname: string): boolean {
  return AUTH_GATED_PREFIXES.some((p) => pathname.startsWith(p));
}

async function fetchStatus(url: string): Promise<number | "error"> {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status;
  } catch {
    return "error";
  }
}

async function main() {
  const visitedInternal = new Set<string>();
  const externalLinks = new Map<string, Set<string>>(); // url -> pages it was found on
  const queue: string[] = ["/"];
  const internalFailures: { path: string; status: number | "error" }[] = [];

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (visitedInternal.has(path)) continue;
    visitedInternal.add(path);

    const url = toAbsolute(path);
    let res: Response;
    try {
      res = await fetch(url, { redirect: "manual" });
    } catch {
      internalFailures.push({ path, status: "error" });
      continue;
    }

    const isRedirect = res.status >= 300 && res.status < 400;
    if (res.status >= 400 && !(isAuthGated(path) && isRedirect)) {
      internalFailures.push({ path, status: res.status });
      continue;
    }
    if (isRedirect) continue; // don't crawl through redirects

    const html = await res.text();
    for (const href of extractHrefs(html)) {
      if (isSkippable(href)) continue;

      if (isInternal(href)) {
        const pathname = href.startsWith(BASE_URL) ? href.slice(BASE_URL.length) : href;
        const cleanPath = pathname.split("#")[0] || "/";
        if (!visitedInternal.has(cleanPath)) queue.push(cleanPath);
      } else if (href.startsWith("http")) {
        if (!externalLinks.has(href)) externalLinks.set(href, new Set());
        externalLinks.get(href)!.add(path);
      }
    }
  }

  console.log(`Crawled ${visitedInternal.size} internal route(s).\n`);

  if (internalFailures.length > 0) {
    console.log("Internal route failures:");
    for (const f of internalFailures) console.log(`  [FAIL] ${f.status}  ${f.path}`);
  } else {
    console.log("No internal route failures.");
  }

  console.log(`\nChecking ${externalLinks.size} unique external link(s)...`);
  const externalResults = await Promise.all(
    [...externalLinks.keys()].map(async (url) => ({ url, status: await fetchStatus(url) })),
  );
  const externalFailures = externalResults.filter(
    (r) => r.status === "error" || (typeof r.status === "number" && r.status >= 400),
  );

  for (const r of externalFailures) {
    const foundOn = [...(externalLinks.get(r.url) ?? [])].join(", ");
    console.log(`  [FAIL] ${r.status}  ${r.url}\n         found on: ${foundOn}`);
  }
  if (externalFailures.length === 0) {
    console.log("No external link failures (some hosts block automated checks — verify failures manually).");
  }

  const totalFailures = internalFailures.length + externalFailures.length;
  console.log(`\n${totalFailures} total failure(s).`);
  if (totalFailures > 0) process.exitCode = 1;
}

main();
