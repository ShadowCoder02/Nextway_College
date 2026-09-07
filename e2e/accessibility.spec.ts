import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { registerAndVerifyApplicantViaBrowser } from "./helpers";

// Suite 9 — Accessibility (regression suite, docs/fix-prompts.md "GitHub
// Copilot — Prompt 1"). Deliberately not duplicating the Lighthouse CI job
// (.lighthouserc.js) already in CI — that runs a category-level
// accessibility score on 3 routes. axe-core here catches per-element
// violations across every route, plus the specific assertions the spec
// calls out by name that a Lighthouse score can't verify (focus trap,
// Escape-to-close, aria-hidden glyphs, 400% zoom reflow).

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/schools",
  "/programmes",
  "/programmes/bsc-information-technology",
  "/admissions",
  "/news",
  "/news/applications-open-2026-intake",
  "/events",
  "/events/open-day-explore-programmes",
  "/branches",
  "/careers",
  "/contact",
  "/student-life",
  "/privacy",
  "/terms",
  "/apply",
  "/apply/register",
  "/apply/login",
  "/apply/verify",
  "/apply/forgot-password",
  "/apply/reset-password",
  "/portal/login",
];

// Observed flaky (roughly 1 in 10-20 runs, varying route each time —
// caught it on /schools, /news, /student-life, /careers across different
// runs): a "serious" color-contrast violation on badge/pill elements like
// careers' `<span class="bg-ice ... text-navy">Full-time</span>`. Captured
// the exact node once with full detail — navy-on-ice is a ~15:1 contrast
// pairing at rest, nowhere near a real WCAG failure, so this reads as axe
// sampling pixel color during a transient paint/hydration race rather than
// a genuine design defect (confirmed no CSS change fixes it: the class as
// written is already compliant). Not chasing further or touching any
// component for this — flagging as an observed, low-frequency, apparently
// false-positive flake rather than claiming a root cause without evidence.
for (const route of PUBLIC_ROUTES) {
  test(`axe: ${route} has no serious/critical violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .include("body")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (seriousOrCritical.length > 0) {
      const detail = seriousOrCritical
        .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`)
        .join("\n");
      throw new Error(`${route}:\n${detail}`);
    }
  });
}

// FIXED, was a GAP: /apply/register, /apply/login, /apply/verify and
// /apply/reset-password used to intermittently render zero H1s under load
// — the raw HTML bailed to `data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"`
// inside an empty <main>, deferring the whole page to post-hydration
// client rendering (a visibly blank page for however long that took, on
// the mid-range-Android/4G audience this site targets). Confirmed same
// root cause as the router.push bug in e2e/programmes.spec.ts: src/app/
// (site)/loading.tsx's automatic outer Suspense boundary, nested around
// each page's own explicit <Suspense> for useSearchParams. Removing
// loading.tsx (the inner boundaries are still required by Next's build —
// verified independently) eliminated this too: 23/23 routes passed
// cleanly and consistently afterward.
test.describe("exactly one H1 per page", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has exactly one H1`, async ({ page }) => {
      await page.goto(route);
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `${route} should have exactly one H1`).toBe(1);
    });
  }
});

test("every input on the enquiry form has an associated label", async ({ page }) => {
  await page.goto("/contact");
  const inputs = page.locator("input:not([type=hidden]), textarea, select");
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const ariaLabel = await input.getAttribute("aria-label");
    const ariaLabelledBy = await input.getAttribute("aria-labelledby");
    if (ariaLabel || ariaLabelledBy) continue;

    const id = await input.getAttribute("id");
    if (id) {
      const explicitLabel = page.locator(`label[for="${id}"]`);
      if ((await explicitLabel.count()) > 0) continue;
    }

    // Implicit labeling: <label><input/>text</label> is a valid WCAG
    // pattern too (the consent checkbox uses this, with no id at all).
    const hasWrappingLabel = await input.evaluate((el) => el.closest("label") !== null);
    expect(hasWrappingLabel, "input has no id-linked label, aria-label/labelledby, or wrapping <label>").toBe(true);
  }
});

// FIXED, was a GAP found in e2e/application-flow.spec.ts: every field on
// /apply/portal/form (the form collecting NIC/passport data) had zero
// programmatic label association — 22 <label> elements, 0 htmlFor. Fixed
// in ApplicationFormClient.tsx via useId()-generated id/htmlFor pairs, plus
// aria-label on the two Subjects & Grades table inputs that had no <label>
// element at all. axe-core's "label" rule is the direct, general-purpose
// check for "does this form control have an accessible name" — scoped here
// rather than relying on the broader serious/critical scan above, so a
// regression here fails on exactly the right signal. The form is gated
// behind auth and split across 5 steps rendered by a `?step=` query param
// (see e2e/file-upload.spec.ts's `loginViaBrowser` for the same pattern),
// so this logs in once and re-scans at each step.
test("every form control on /apply/portal/form has an accessible name (all 5 steps)", async ({ page }) => {
  await registerAndVerifyApplicantViaBrowser(page, {
    fullName: "E2E Accessibility Tester",
    emailPrefix: "e2e-a11y-form",
  });

  for (let step = 1; step <= 5; step++) {
    await page.goto(`/apply/portal/form?step=${step}`);
    // ApplicationFormClient shows a spinner until its own initial-load
    // fetch resolves — page.goto's default 'load' wait doesn't cover that,
    // so scanning too early would see an empty <main> rather than the
    // step's real form controls. Each step renders its own "Step N —" h2
    // once loaded.
    await expect(page.getByRole("heading", { name: new RegExp(`Step ${step} —`) })).toBeVisible({
      timeout: 10000,
    });
    const results = await new AxeBuilder({ page }).include("body").withRules(["label"]).analyze();

    if (results.violations.length > 0) {
      const detail = results.violations
        .map((v) => `${v.id}: ${v.help} — ${v.nodes.map((n) => n.html).join(", ")}`)
        .join("\n");
      throw new Error(`/apply/portal/form?step=${step}:\n${detail}`);
    }
  }
});

test("a validation error is linked via aria-describedby and announced via aria-live", async ({ page }) => {
  await page.goto("/contact");
  // The form has noValidate (LeadForm.tsx) — submitting empty required
  // fields goes through zod, not native HTML5 validation, and
  // focusFirstInvalid checks fields in the order [fullName, phone, email],
  // so fullName is deterministically the one that gets focused/erred here.
  const fullNameInput = page.getByLabel(/full name/i);
  await page.getByRole("button", { name: /submit enquiry/i }).click();

  await expect(fullNameInput).toHaveAttribute("aria-invalid", "true");
  const describedBy = await fullNameInput.getAttribute("aria-describedby");
  expect(describedBy, "fullName has no aria-describedby once invalid").toBeTruthy();

  const linkedError = page.locator(`#${describedBy}`);
  await expect(linkedError).toBeVisible();
  // role="alert" is itself an implicit assertive live region per the ARIA
  // spec — LeadForm.tsx doesn't additionally wrap field-level errors in an
  // explicit aria-live (that's reserved for the separate offline-status
  // banner elsewhere in the same form), so this is the actual announcement
  // mechanism to check, not a nearby aria-live attribute.
  await expect(linkedError).toHaveAttribute("role", "alert");
  await expect(linkedError).not.toBeEmpty();
});

test("mobile menu: opens by keyboard, traps focus, closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: /toggle menu/i });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#mobile-nav-panel")).toBeVisible();

  // Focus should have moved into the panel (the first focusable link).
  const activeInPanel = await page.evaluate(() => {
    const panel = document.getElementById("mobile-nav-panel");
    return panel?.contains(document.activeElement) ?? false;
  });
  expect(activeInPanel).toBe(true);

  // Shift+Tab from the first focusable element should wrap to the last
  // (focus trap), not escape the panel.
  await page.keyboard.press("Shift+Tab");
  const wrappedToLast = await page.evaluate(() => {
    const panel = document.getElementById("mobile-nav-panel");
    if (!panel) return false;
    const focusable = panel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    return document.activeElement === focusable[focusable.length - 1];
  });
  expect(wrappedToLast).toBe(true);

  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-nav-panel")).not.toBeVisible();
  // Focus should return to the toggle button.
  const focusReturned = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") === "Toggle menu",
  );
  expect(focusReturned).toBe(true);
});

test("the floating WhatsApp button has an accessible name", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("link", { name: /chat on whatsapp/i });
  await expect(button).toBeVisible();
});

test("decorative checkmark glyphs are aria-hidden (not double-announced)", async ({ page }) => {
  await page.goto("/");
  const checkmarks = page.locator('span[aria-hidden="true"]', { hasText: "✓" });
  expect(await checkmarks.count()).toBeGreaterThan(0);
});

// test.fail(): documents a real, currently-failing case without silently
// adjusting the assertion — Playwright's equivalent of vitest's it.fails(),
// used the same way in src/lib/validation.test.ts. Reported, not fixed here.
test(
  "GAP: /admissions ordered list double-announces as '1. 01 Discover' (step-number span is not aria-hidden)",
  async ({ page }) => {
    test.fail();
    await page.goto("/admissions");
    const firstStepBadge = page.locator("ol li").first().locator("span").first();
    const ariaHidden = await firstStepBadge.getAttribute("aria-hidden");
    expect(ariaHidden).toBe("true");
  },
);

test("layout reflows at 400% zoom without horizontal scrolling", async ({ page }) => {
  // 400% zoom on a 1280x800 viewport is equivalent to laying out at 320x200
  // CSS px — WCAG 1.4.10's own reference viewport width for this check.
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalScroll).toBe(false);
});
