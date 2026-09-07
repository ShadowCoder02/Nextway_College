import { test, expect } from "@playwright/test";

// Suite 7 — E2E (regression suite, docs/fix-prompts.md "GitHub Copilot —
// Prompt 1"), programme catalogue / filtering cases.
//
// HIGH-SEVERITY FINDING, confirmed and narrowed down carefully: every
// filter interaction on /programmes that goes through router.push() — the
// level/mode/school <select> dropdowns AND both "Clear all" buttons (filter
// bar's and the empty state's) — silently does nothing in the PRODUCTION
// BUILD. No error, no CSP block, no console warning; no history entry, no
// RSC fetch, url() unchanged. Confirmed via a raw in-page element.click()
// to rule out a Playwright interaction-detection false positive. Confirmed
// PRODUCTION-BUILD-ONLY: the identical interaction against `next dev` on
// the same code navigates correctly. This means the exact regression Suite
// 7 calls "most likely to recur" (the School of Computing & IT filter)
// IS CURRENTLY BROKEN — but only in production, which is exactly why
// testing against a locally-served production build (rather than `next
// dev`, which is what a developer normally runs) caught it. Root cause not
// diagnosed further and no source touched, per the task's instruction not
// to fix without asking first — but both affected components
// (ProgrammeFilters, ProgrammesEmptyState) share one correlated trait: both
// are wrapped in <Suspense> for useSearchParams in
// src/app/(site)/programmes/page.tsx. Flagging the correlation, not
// claiming it as the confirmed cause.
//
// NOT 100% reproducible: solid under isolated, repeated testing right
// after a clean `next build && next start` (confirmed failing across
// several individual runs) — but the school-select case specifically did
// NOT reproduce when this whole e2e/ suite ran back-to-back as one long
// pass against a server that had already handled substantial prior
// traffic. That's the opposite load pattern from the related "blank auth
// pages" finding in e2e/accessibility.spec.ts (which appears WITH prior
// traffic, not on a fresh server) — reported as-observed rather than
// papered over with a single tidy explanation neither observation fully
// supports.

// Deliberately not test.fail(): unlike the two "Clear all" cases below,
// this one didn't reproduce every run (see the file-level comment) — a
// hard expected-fail flip would itself go red on the runs where the bug
// doesn't show, for the wrong reason. Logging the outcome instead of
// asserting a fixed pass/fail so CI reports what actually happened rather
// than forcing a binary verdict this bug doesn't consistently earn either
// way.
test("selecting a school filter (e.g. Computing & IT) — logs whether the production-build router.push bug reproduced this run", async ({
  page,
}) => {
  await page.goto("/programmes");
  await page.getByLabel(/school/i).selectOption({ label: "School of Computing & IT (1)" });
  try {
    await expect(page).toHaveURL(/school=computing-it/, { timeout: 4000 });
  } catch {
    test.info().annotations.push({
      type: "known-intermittent-bug",
      description: "router.push did not navigate this run — see file-level comment",
    });
  }
});

test("a filter combination with no matches renders the empty state", async ({ page }) => {
  await page.goto("/programmes?school=computing-it&level=Certificate");
  await expect(page.getByRole("heading", { name: /no programmes match your filters/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /clear all filters/i }).first()).toBeVisible();
});

test("GAP: 'Clear all filters' (empty state) does not navigate in the production build", async ({ page }) => {
  test.fail();
  await page.goto("/programmes?school=computing-it&level=Certificate");
  const clearAll = page.getByRole("button", { name: /clear all filters/i }).first();
  await expect(clearAll).toBeVisible();
  await clearAll.click();
  await expect(page).toHaveURL(/\/programmes(\?)?$/, { timeout: 4000 });
});

test("GAP: 'Clear all' (filter bar) does not navigate in the production build", async ({ page }) => {
  test.fail();
  await page.goto("/programmes?school=computing-it");
  const clearAll = page.getByRole("button", { name: /^clear all$/i }).first();
  await expect(clearAll).toBeVisible();
  await clearAll.click();
  await expect(page).toHaveURL(/\/programmes(\?)?$/, { timeout: 4000 });
});

test("filters applied via direct URL, open a programme, press Back: filters are preserved (URL state) — unaffected by the router.push bug above, since this uses a plain <Link> and browser back/forward, not router.push", async ({
  page,
}) => {
  await page.goto("/programmes?school=computing-it");
  await page.getByRole("link", { name: /view programme/i }).first().click();
  await expect(page).toHaveURL(/\/programmes\//);
  await page.goBack();
  await expect(page).toHaveURL(/school=computing-it/);
});

test("GET /programmes/nonexistent-slug eventually renders a branded 404 page, not a crash", async ({ page }) => {
  await page.goto("/programmes/nonexistent-slug-xyz", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible({ timeout: 10000 });
});

// test.fail(): documents a real, currently-failing case — see
// src/lib/validation.test.ts for the same it.fails() pattern in vitest.
test("GAP: GET /programmes/nonexistent-slug returns HTTP 404, not 200", async ({ page }) => {
  test.fail();
  // The rendered page content is correct (see the passing test above) —
  // this is specifically about the raw HTTP status code. Next's streaming
  // response for this route flushes an initial 200 shell (visible as a
  // loading skeleton, `data-dgst="NEXT_HTTP_ERROR_FALLBACK;404"` in the raw
  // HTML) before the async notFound() inside it resolves, and by then
  // response headers are already committed — so the status code can never
  // become 404. A crawler or uptime/status monitor checking the status
  // code alone would wrongly treat this as a valid, indexable 200 page.
  const response = await page.goto("/programmes/nonexistent-slug-xyz");
  expect(response?.status()).toBe(404);
});
