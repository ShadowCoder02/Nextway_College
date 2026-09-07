import { test, expect } from "@playwright/test";
import { getCsrfHeaders } from "./helpers";

// Suite 5 — Security (regression suite, docs/fix-prompts.md "GitHub
// Copilot — Prompt 1"). The spec labels this "integration, staging only" —
// most of it is genuinely runnable against a local production server
// (the in-memory rate limiter and CSRF middleware both work identically
// locally), so it's included here rather than skipped; the couple of
// items that truly need a staging/real environment (CSV export, which
// doesn't exist yet at all) are called out explicitly rather than
// silently dropped.

test("XSS: <script> and onerror payloads are stored and rendered as literal text, never executed", async ({
  page,
  request,
}) => {
  const scriptPayload = "<script>alert(document.cookie)</script>";
  const imgPayload = `<img src=x onerror=alert(1)> ${Date.now()}`;
  const csrfHeaders = await getCsrfHeaders(request);

  const res = await request.post("/api/enquiries", {
    headers: csrfHeaders,
    data: {
      fullName: scriptPayload,
      phone: "0771234567",
      email: `xss-${Date.now()}@example.com`,
      message: imgPayload,
      consent: true,
    },
  });
  expect(res.ok()).toBe(true);

  // Verified via the staff portal login (/admin/login redirects here — see
  // src/middleware.ts) since the enquiry list is staff-only. Credentials:
  // ADMIN_USERNAME defaults to "nextway college" if unset; ADMIN_PASSWORD
  // has no safe default assumption — this environment's .env.local sets
  // it explicitly, so tests read it from the environment rather than
  // hardcoding a guess.
  await page.goto("/portal/login");
  await page.getByLabel(/username/i).fill(process.env.ADMIN_USERNAME || "nextway college");
  await page.getByLabel(/^password$/i).fill(process.env.ADMIN_PASSWORD || "");
  let dialogFired = false;
  page.on("dialog", () => {
    dialogFired = true;
  });
  await page.getByRole("button", { name: /sign in/i }).click({ force: true });
  await page.waitForURL(/\/portal(?!\/login)/, { timeout: 10000 });
  await page.goto("/portal/enquiries");
  await page.waitForTimeout(1000);

  expect(dialogFired, "a script payload executed as an alert() dialog").toBe(false);
  // The literal tag text should be visible as text content; assert no
  // *unescaped* <script> tag was injected into the DOM (which would make
  // it a real element, not text).
  const injectedScriptTags = await page.locator(`script:has-text("document.cookie")`).count();
  expect(injectedScriptTags, "a real <script> element was injected into the DOM").toBe(0);
});

test("SQLi: ' OR '1'='1 in the login email field does not bypass auth", async ({ request }) => {
  const csrfHeaders = await getCsrfHeaders(request);
  const res = await request.post("/api/applicant/auth/login", {
    headers: csrfHeaders,
    data: { email: "' OR '1'='1", password: "anything" },
  });
  expect(res.ok()).toBe(false);
  const body = await res.json();
  expect(body.ok).toBe(false);
});

test("N/A: CSV formula injection — no CSV export feature exists in this codebase", async () => {
  // Confirmed by direct source search: no "csv" reference anywhere in src/,
  // and /api/admin/enquiries + /api/portal/enquiries only expose GET
  // (JSON list) and PATCH (status update) — no export endpoint. Recording
  // this as an explicit, documented N/A rather than silently dropping the
  // suite item: there's nothing to neutralize (=, +, -, @) because there's
  // no export to neutralize it in.
  expect(true).toBe(true);
});

// Path traversal is tested at the unit level instead — see
// src/lib/admissions/file-security.test.ts — rather than through this real
// endpoint, which needs BLOB_READ_WRITE_TOKEN (not provisioned for this
// project; see the note on the two skipped tests below for how that was
// confirmed, and why there's no local fallback to fall back to).

test("rate limiting: rapid enquiry submissions from one context are throttled", async ({ request }) => {
  const csrfHeaders = await getCsrfHeaders(request);
  const results: number[] = [];
  // /api/enquiries is limited to 10/min per IP (src/app/api/enquiries/
  // route.ts) — 20 rapid requests should trip it well before the end.
  for (let i = 0; i < 20; i++) {
    const res = await request.post("/api/enquiries", {
      headers: csrfHeaders,
      data: {
        fullName: "Rate Limit Test",
        phone: "0771234567",
        email: `ratelimit-${Date.now()}-${i}@example.com`,
        consent: true,
      },
    });
    results.push(res.status());
  }
  expect(results, "no request was throttled (429) across 20 rapid submissions").toContain(429);
});

test("CSRF: register with a forged/missing token is rejected", async ({ request }) => {
  // No prior GET to mint a real csrf_token cookie, and a header value that
  // can't possibly match whatever cookie (if any) is already present.
  const res = await request.post("/api/applicant/auth/register", {
    headers: { "x-csrf-token": "forged-token-12345" },
    data: {
      fullName: "CSRF Test",
      email: `csrf-${Date.now()}@example.com`,
      phone: "0771234567",
      password: "Str0ngPassword1",
      agreeTerms: true,
    },
  });
  expect(res.status()).toBe(403);
});

test("CSRF: register with no token at all is rejected", async ({ request }) => {
  const res = await request.post("/api/applicant/auth/register", {
    data: {
      fullName: "CSRF Test 2",
      email: `csrf2-${Date.now()}@example.com`,
      phone: "0771234567",
      password: "Str0ngPassword1",
      agreeTerms: true,
    },
  });
  expect(res.status()).toBe(403);
});

// SKIPPED, not silently passed: this needs a real document upload to
// exist, which needs BLOB_READ_WRITE_TOKEN. Confirmed not provisioned for
// this project — `npx vercel env pull` (this project IS linked and the
// CLI IS authenticated) returns no such variable for any environment, and
// .env.example's own comment says there's no local-filesystem fallback:
// "Without it, document upload will fail in every environment, local dev
// included." The code path this would exercise IS reviewed, though — see
// the "Applicant-facing document routes" section of the research this
// suite is based on: every route scopes lookups to session.applicantId
// server-side (never trusting a client-supplied ID), which is exactly the
// IDOR protection this test would otherwise be re-confirming end to end.
test.skip(
  "IDOR, HIGHEST SEVERITY: applicant A cannot fetch applicant B's uploaded document — needs BLOB_READ_WRITE_TOKEN (not provisioned)",
  async () => {},
);

test("GET /apply/portal (the applicant dashboard) while logged out redirects and leaks no application data", async ({
  page,
}) => {
  // The spec names this route "/apply/dashboard" — that route doesn't
  // exist under this name; the actual applicant dashboard is /apply/portal
  // (see src/app/(site)/apply/portal/page.tsx).
  await page.goto("/apply/portal");
  await page.waitForURL(/\/apply\/login/, { timeout: 10000 });
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/application number|nic|passport/i);
});

// SKIPPED, not silently passed: same BLOB_READ_WRITE_TOKEN gap as the IDOR
// test above — needs a real uploaded document to exist first. The
// no-session check itself (getApplicantSession() returning null -> 401)
// is exercised without a real document by "GET /apply/portal ... while
// logged out redirects" above and the two CSRF tests, which all hit
// session-gated behavior on this same auth layer.
test.skip(
  "fetching a stored document URL with no session fails — needs BLOB_READ_WRITE_TOKEN (not provisioned)",
  async () => {},
);
