import { test, expect } from "@playwright/test";

// Suite 7 — E2E (regression suite, docs/fix-prompts.md "GitHub Copilot —
// Prompt 1"), programme catalogue / filtering cases.
//
// FIXED, was a HIGH-SEVERITY finding: every filter interaction on
// /programmes that goes through router.push() — the level/mode/school
// <select> dropdowns and both "Clear all" buttons — used to silently do
// nothing in the PRODUCTION BUILD only (confirmed via raw in-page
// element.click(), absent under `next dev`). Root cause, confirmed by a
// controlled removal experiment: src/app/(site)/loading.tsx's automatic
// Suspense boundary, nested around the explicit <Suspense> boundaries this
// page's ProgrammeFilters/ProgrammesEmptyState need for useSearchParams(),
// interfered with the client-side router during navigation. Removing
// loading.tsx (the inner Suspense boundaries are still required by Next's
// own build-time useSearchParams() check — verified independently, that
// requirement holds with or without loading.tsx) eliminated the bug
// entirely: 8/8 isolated attempts navigated on the first try afterward,
// versus a measured ~40-60% failure rate before. These are now plain hard
// assertions rather than the retry/test.fail() scaffolding used while this
// was still an open, intermittent bug.

test("selecting a school filter (e.g. Computing & IT) navigates and shows the matching programme", async ({
  page,
}) => {
  await page.goto("/programmes");
  await page.getByLabel(/school/i).selectOption({ label: "School of Computing & IT (1)" });
  await expect(page).toHaveURL(/school=computing-it/);
  await expect(page.getByText("BSc Information Technology", { exact: false })).toBeVisible();
});

test("a filter combination with no matches renders the empty state with a working Clear all filters", async ({
  page,
}) => {
  await page.goto("/programmes?school=computing-it&level=Certificate");
  await expect(page.getByRole("heading", { name: /no programmes match your filters/i })).toBeVisible();
  const clearAll = page.getByRole("button", { name: /clear all filters/i }).first();
  await expect(clearAll).toBeVisible();
  await clearAll.click();
  await expect(page).toHaveURL(/\/programmes(\?)?$/);
});

test("'Clear all' on the filter bar navigates back to the unfiltered list", async ({ page }) => {
  await page.goto("/programmes?school=computing-it");
  const clearAll = page.getByRole("button", { name: /^clear all$/i }).first();
  await expect(clearAll).toBeVisible();
  await clearAll.click();
  await expect(page).toHaveURL(/\/programmes(\?)?$/);
});

test("filters applied, open a programme, press Back: filters are preserved (URL state)", async ({ page }) => {
  await page.goto("/programmes?school=computing-it");
  await page.getByRole("link", { name: /view programme/i }).first().click();
  await expect(page).toHaveURL(/\/programmes\//);
  await page.goBack();
  await expect(page).toHaveURL(/school=computing-it/);
});

// FIXED, same root cause as above: the streaming response used to commit
// a 200 status (visible as a loading skeleton, `data-dgst="NEXT_HTTP_
// ERROR_FALLBACK;404"`, in the raw HTML) before the async notFound() could
// resolve — a crawler or status monitor checking the code alone would have
// wrongly treated this as a valid, indexable page. Confirmed fixed by the
// same loading.tsx removal: status is now a real 404 with no skeleton.
test("GET /programmes/nonexistent-slug renders a branded 404 page with the correct HTTP status", async ({
  page,
}) => {
  const response = await page.goto("/programmes/nonexistent-slug-xyz");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});
