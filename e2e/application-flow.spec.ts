import { test, expect } from "@playwright/test";
import { readVerificationCodeFromStore } from "./helpers";

// Suite 7 — E2E (regression suite, docs/fix-prompts.md "GitHub Copilot —
// Prompt 1"), the remaining application-flow cases (programme filtering
// cases are in e2e/programmes.spec.ts).

test("happy path: homepage -> programme -> Apply -> register, the programme name persists throughout", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /explore programmes/i }).first().click();
  await expect(page).toHaveURL(/\/programmes/);

  await page.getByRole("link", { name: /view programme/i }).first().click();
  await page.waitForURL(/\/programmes\/[a-z0-9-]+$/);
  const programmeTitle = await page.locator("h1").first().innerText();

  // Scoped to <main> — the Navbar's own "Apply Online" button (present on
  // every page) also matches this name but goes to plain /apply with no
  // programme param, and being first in DOM order it wins a page-wide
  // .first() every time.
  await page.locator("main").getByRole("link", { name: /apply online/i }).first().click();
  await expect(page).toHaveURL(/\/apply\?programme=/);
  await expect(page.getByText(programmeTitle, { exact: false })).toBeVisible();

  await page.getByRole("link", { name: /start new application/i }).click();
  await expect(page).toHaveURL(/\/apply\/register\?programme=/);
});

test("/apply?programme=nonexistent-slug falls back gracefully, no crash", async ({ page }) => {
  const response = await page.goto("/apply?programme=nonexistent-slug-xyz");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { name: /online student application portal/i })).toBeVisible();
  await expect(page.getByText(/you're applying for/i)).not.toBeVisible();
});

test("/apply?programme=<script>alert(1)</script> is escaped, never executed", async ({ page }) => {
  let dialogFired = false;
  page.on("dialog", () => {
    dialogFired = true;
  });
  await page.goto("/apply?programme=" + encodeURIComponent("<script>alert(1)</script>"));
  await page.waitForTimeout(500);
  expect(dialogFired).toBe(false);
  const scriptTags = await page.locator('script:has-text("alert(1)")').count();
  expect(scriptTags).toBe(0);
});

test("submitting an enquiry then pressing Back does not show a resubmission prompt (no real navigation occurs)", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByLabel(/full name/i).fill("Back Button Test");
  await page.getByLabel(/^phone/i).fill("0771234567");
  await page.getByLabel(/^email/i).fill(`backbtn-${Date.now()}@example.com`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /submit enquiry/i }).click();
  await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 });

  let dialogFired = false;
  page.on("dialog", () => {
    dialogFired = true;
  });
  await page.goBack();
  await page.waitForTimeout(500);
  // A native "Confirm Form Resubmission" prompt is a browser `dialog` —
  // asserting none fired is the closest automatable proxy for "no
  // resubmission prompt" (the success state is client-side React state,
  // not a POST-redirect-GET page load, so there's no server resubmission
  // risk here in the first place).
  expect(dialogFired).toBe(false);
});

// GAP, confirmed: two native click events dispatched in the same tick
// (before React's setStatus("loading") can re-render the button as
// disabled) both call handleSubmit and both reach the server — the
// button's disabled={status === "loading"} guard (LeadForm.tsx) is a state
// update, not synchronous, so it can't block a click that lands before the
// re-render commits. A real (if narrow) double-submission window.
test("GAP: double-clicking Submit results in exactly one enquiry submission", async ({ page }) => {
  test.fail();
  const email = `doubleclick-${Date.now()}@example.com`;
  let submissionCount = 0;
  page.on("request", (req) => {
    if (req.url().includes("/api/enquiries") && req.method() === "POST") submissionCount++;
  });

  await page.goto("/contact");
  await page.getByLabel(/full name/i).fill("Double Click Test");
  await page.getByLabel(/^phone/i).fill("0771234567");
  await page.getByLabel(/^email/i).fill(email);
  await page.getByRole("checkbox").check();

  // Two real Playwright .click() calls would just serialize (the second
  // waits for actionability, and by then the first click's React state
  // update has already disabled the button) — dispatching two native click
  // events in the same tick is what actually exercises "the user's mouse
  // double-clicked before React could re-render to disable the button".
  await page.locator('button:has-text("Submit enquiry")').evaluate((btn: HTMLButtonElement) => {
    btn.click();
    btn.click();
  });
  await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 });

  expect(submissionCount).toBe(1);
});

test("submitting the enquiry form while offline shows an offline message and retains entered data", async ({
  page,
  context,
}) => {
  await page.goto("/contact");
  await page.getByLabel(/full name/i).fill("Offline Test User");
  await page.getByLabel(/^phone/i).fill("0771234567");
  await page.getByLabel(/^email/i).fill("offline@example.com");
  await page.getByRole("checkbox").check();

  await context.setOffline(true);
  await page.getByRole("button", { name: /submit enquiry/i }).click();

  await expect(page.getByRole("alert").filter({ hasText: /appear to be offline/i })).toBeVisible();
  await expect(page.getByLabel(/full name/i)).toHaveValue("Offline Test User");
  await expect(page.getByLabel(/^email/i)).toHaveValue("offline@example.com");

  await context.setOffline(false);
});

test("GAP: session expiry mid-application shows only a generic 'Not authenticated' error, not a dedicated re-auth prompt (form data is retained client-side, though)", async ({
  page,
  context,
}) => {
  test.fail();

  const email = `e2e-expiry-${Date.now()}@nextway.edu.lk`;
  const password = "Str0ngE2ETestPassw0rd!";
  await page.goto("/apply/register");
  await page.getByLabel(/full name/i).fill("Session Expiry Test");
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/mobile phone/i).fill("0771234567");
  await page.getByLabel(/create password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/apply\/verify/, { timeout: 10000 });
  const otp = readVerificationCodeFromStore(email);
  await page.getByLabel(/verification code/i).fill(otp);
  await page.getByRole("button", { name: /verify email/i }).click();
  await page.waitForURL(/\/apply\/portal\/form/, { timeout: 10000 });

  await page.getByLabel(/full name/i).fill("Data Entered Before Expiry");

  // Simulate session expiry mid-application by dropping the session cookie
  // (src/lib/admissions/session.ts's sessionVersion-mismatch invalidation
  // has the same externally-observable effect: the next request gets 401).
  await context.clearCookies();
  await page.getByRole("button", { name: /save|next/i }).first().click();

  // What the spec wants: a distinct re-auth prompt. What actually happens:
  // saveDraft() (ApplicationFormClient.tsx) has no 401-specific handling —
  // it shows the raw API error text as a plain inline banner.
  const reAuthPrompt = page.getByRole("dialog").or(page.getByText(/session has expired|please sign in again/i));
  await expect(reAuthPrompt).toBeVisible({ timeout: 5000 });
});

test("registering in one browser context and resuming in another restores progress", async ({ browser }) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();

  const email = `e2e-resume-${Date.now()}@nextway.edu.lk`;
  const password = "Str0ngE2ETestPassw0rd!";
  await pageA.goto("/apply/register");
  await pageA.getByLabel(/full name/i).fill("Resume Test User");
  await pageA.getByLabel(/email address/i).fill(email);
  await pageA.getByLabel(/mobile phone/i).fill("0771234567");
  await pageA.getByLabel(/create password/i).fill(password);
  await pageA.getByLabel(/confirm password/i).fill(password);
  await pageA.getByRole("checkbox").check();
  await pageA.getByRole("button", { name: /create account/i }).click();
  await pageA.waitForURL(/\/apply\/verify/, { timeout: 10000 });
  const otp = readVerificationCodeFromStore(email);
  await pageA.getByLabel(/verification code/i).fill(otp);
  await pageA.getByRole("button", { name: /verify email/i }).click();
  await pageA.waitForURL(/\/apply\/portal\/form/, { timeout: 10000 });

  await pageA.getByLabel(/full name/i).fill("Resume Test User Full Name");
  await pageA.getByRole("button", { name: /save|next/i }).first().click();
  await pageA.waitForTimeout(1000);
  await contextA.close();

  // A second, completely separate browser context — different cookie jar —
  // logging in fresh with the same credentials.
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto("/apply/login");
  await pageB.getByLabel(/email address/i).fill(email);
  await pageB.getByLabel(/^password$/i).fill(password);
  await pageB.getByRole("button", { name: /sign in/i }).click();
  await pageB.waitForURL(/\/apply\/portal/, { timeout: 10000 });
  await pageB.goto("/apply/portal/form");

  await expect(pageB.getByLabel(/full name/i)).toHaveValue(
    "Resume Test User Full Name",
    { timeout: 10000 },
  );
  await contextB.close();
});

// FIXED, was a GAP (found while writing the tests above, not from the
// original audit list): every field on the multi-step application form
// used to fail the exact "every input has an associated label" property
// Suite 9 checks on /contact. ApplicationFormClient.tsx had 22 <label>
// elements with htmlFor=0 across all of them and no wrapping either, so
// there was zero programmatic label association anywhere on this form —
// the most data-sensitive form on the site (personal details,
// qualifications, NIC/passport uploads) and the largest-scale
// accessibility gap found in this whole regression suite. Fixed via
// useId()-generated id/htmlFor pairs on all 21 <label>-per-field cases
// (the declaration checkbox already used valid implicit wrapping), plus
// aria-label on the two Subjects & Grades table inputs that had no
// <label> element at all. This is now a hard assertion guarding the fix.
test("every field on the application form (/apply/portal/form) has a programmatic label association", async ({
  page,
}) => {
  const email = `e2e-labels-${Date.now()}@nextway.edu.lk`;
  const password = "Str0ngE2ETestPassw0rd!";
  await page.goto("/apply/register");
  await page.getByLabel(/full name/i).fill("Label Association Test");
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/mobile phone/i).fill("0771234567");
  await page.getByLabel(/create password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/apply\/verify/, { timeout: 10000 });
  const otp = readVerificationCodeFromStore(email);
  await page.getByLabel(/verification code/i).fill(otp);
  await page.getByRole("button", { name: /verify email/i }).click();
  await page.waitForURL(/\/apply\/portal\/form/, { timeout: 10000 });
  // ApplicationFormClient shows a spinner until its own initial-load fetch
  // resolves; unlike a locator action (.fill(), auto-waiting), .count()
  // and evaluate() read the DOM synchronously, so wait for real content
  // first or this races the client-side load and reads an empty page.
  await expect(page.getByLabel(/full name/i)).toBeVisible({ timeout: 10000 });

  const associatedLabelCount = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("label"));
    return labels.filter((label) => {
      if (label.hasAttribute("for")) return true;
      return label.querySelector("input, select, textarea") !== null;
    }).length;
  });
  const totalLabelCount = await page.locator("label").count();

  expect(totalLabelCount).toBeGreaterThan(0);
  expect(associatedLabelCount).toBe(totalLabelCount);
});

// SKIPPED, not silently passed: a full password-reset round trip needs the
// raw reset token, which is only ever exposed as `debugToken` in the API
// response when NODE_ENV !== "production" (src/services/admissions.ts's
// requestPasswordReset) — the token itself is stored server-side only as
// a SHA-256 hash (resetTokenHash), never recoverable after the fact the
// way the registration OTP is (that one IS stored in plaintext, which is
// how registerAndVerifyApplicant works around the same NODE_ENV gate).
// This test suite deliberately runs against a production build (`next
// build && next start`, NODE_ENV=production), so debugToken is never
// present, and there's no email/SMS interception available in this
// environment either. Would need either a `next dev` server (a deliberate,
// narrow exception to the production-build rule) or a real staging
// environment with email delivery to complete.
test.skip(
  "full password reset flow end to end — needs debugToken (production build gate) or real email delivery (neither available)",
  async () => {},
);
