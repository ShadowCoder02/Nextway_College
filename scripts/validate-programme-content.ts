/**
 * Fails when a published programme has content that should never ship:
 * an empty curriculum, an overview identical to its summary, a placeholder
 * duration, or a missing medium. Run with: npx tsx scripts/validate-programme-content.ts
 *
 * This never invents replacement content — it only reports. Missing content
 * belongs in content/TODO-programmes.md for the college to supply.
 */
import { promises as fs } from "fs";
import path from "path";
import type { Programme } from "../src/types";

const PLACEHOLDER_DURATION = "As per programme structure";

type Issue = { slug: string; title: string; problem: string };

function checkProgramme(p: Programme): Issue[] {
  const issues: Issue[] = [];

  if (p.modules.length === 0) {
    issues.push({ slug: p.slug, title: p.title, problem: "empty curriculum (no modules)" });
  }

  if (p.overview.trim() === p.shortPitch.trim()) {
    issues.push({ slug: p.slug, title: p.title, problem: "overview identical to its summary (shortPitch)" });
  }

  if (p.duration.trim() === PLACEHOLDER_DURATION) {
    issues.push({ slug: p.slug, title: p.title, problem: `placeholder duration ("${PLACEHOLDER_DURATION}")` });
  }

  if (!p.medium || !p.medium.trim()) {
    issues.push({ slug: p.slug, title: p.title, problem: "missing medium" });
  }

  return issues;
}

async function main() {
  const filePath = path.join(process.cwd(), "data", "cms", "programmes.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const programmes: Programme[] = JSON.parse(raw);

  const published = programmes.filter((p) => p.status === "published");
  const allIssues = published.flatMap(checkProgramme);

  if (allIssues.length === 0) {
    console.log(`All ${published.length} published programme(s) pass content validation.`);
    return;
  }

  console.log(`${allIssues.length} content issue(s) found across published programmes:\n`);
  for (const issue of allIssues) {
    console.log(`[${issue.slug}] ${issue.title}: ${issue.problem}`);
  }
  console.log(`\nSee content/TODO-programmes.md for the tracked list.`);
  process.exitCode = 1;
}

main();
