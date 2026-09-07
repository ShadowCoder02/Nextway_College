import type { APIRequestContext, Page } from "@playwright/test";
import { isBlobConfigured, readJsonBlob } from "../src/lib/cms/blob-json-store";

const ADMISSIONS_FILE = "admissions.json";

interface StoredApplicant {
  email: string;
  id: string;
  verificationCode?: string;
}

/**
 * Reads the applicant's OTP straight out of the CMS Blob store rather than
 * relying on the API response's `debugOtp` field — that field is only
 * present when NODE_ENV !== "production" (see src/services/admissions.ts),
 * and these tests deliberately run against a production build (matching
 * the Lighthouse CI decision — see playwright.config.ts). The OTP is
 * stored in plaintext (unlike the password-reset token, which is only
 * ever stored as a SHA-256 hash — see e2e/security.spec.ts for where that
 * distinction blocks a fully-automatable password-reset E2E test).
 *
 * Reads directly from Blob (not through the app) because this data lives
 * in src/lib/cms/blob-json-store.ts's private store as of the fix for
 * production's EROFS write failures — the store used to be a local JSON
 * file this could readFileSync, which no longer reflects what the running
 * app actually persists. Reuses that module's own readJsonBlob() rather
 * than re-implementing the get→stream→JSON.parse sequence here, so a
 * future change to that logic (retry policy, the SDK's 304 case, etc.)
 * only has one place to happen.
 *
 * Checks isBlobConfigured() explicitly first: without it, the app's own
 * writes throw immediately (see writeJsonBlob), but a bare readJsonBlob()
 * call here would just return the empty fallback and only fail two lines
 * later with a generic "no verificationCode found" — technically correct,
 * but it reads as "this applicant doesn't exist" rather than "this test
 * run has no Blob credentials," which is the actual, fixable problem.
 */
async function readAdmissionsStore(): Promise<{ applicants: StoredApplicant[] }> {
  if (!isBlobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set for this test run. These tests read the applicant's OTP directly from Blob storage and can't find it without real credentials — set it in .env.local locally, or as a BLOB_READ_WRITE_TOKEN repository secret in GitHub Actions for CI.",
    );
  }
  return readJsonBlob<{ applicants: StoredApplicant[] }>(ADMISSIONS_FILE, { applicants: [] });
}

export async function readVerificationCodeFromStore(email: string): Promise<string> {
  const store = await readAdmissionsStore();
  const applicant = store.applicants.find((a) => a.email === email);
  if (!applicant?.verificationCode) {
    throw new Error(`No pending verificationCode found in the store for ${email}`);
  }
  return applicant.verificationCode;
}

export async function readApplicantIdFromStore(email: string): Promise<string> {
  const store = await readAdmissionsStore();
  const applicant = store.applicants.find((a) => a.email === email);
  if (!applicant?.id) throw new Error(`No applicant found in the store for ${email}`);
  return applicant.id;
}

async function getCsrfHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  // The CSRF cookie is minted lazily on any response — a plain GET is
  // enough to receive it (see src/middleware.ts's withCsrfCookie()).
  await request.get("/");
  const cookies = await request.storageState();
  const csrfCookie = cookies.cookies.find((c) => c.name === "csrf_token");
  if (!csrfCookie) throw new Error("No csrf_token cookie set after GET /");
  return { "x-csrf-token": csrfCookie.value };
}

/** Registers a fresh, uniquely-emailed applicant and verifies it via the
 * real OTP flow, returning the email/password/applicantId and a
 * request context already holding the resulting session cookie. */
export async function registerAndVerifyApplicant(
  request: APIRequestContext,
  opts?: { fullName?: string; password?: string },
): Promise<{ email: string; password: string; applicantId: string }> {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@nextway.edu.lk`;
  const password = opts?.password ?? "Str0ngE2ETestPassw0rd!";
  const fullName = opts?.fullName ?? "E2E Test Applicant";
  const csrfHeaders = await getCsrfHeaders(request);

  const registerRes = await request.post("/api/applicant/auth/register", {
    headers: csrfHeaders,
    data: { fullName, email, phone: "0771234567", password, agreeTerms: true },
  });
  if (!registerRes.ok()) {
    throw new Error(`register failed: ${registerRes.status()} ${await registerRes.text()}`);
  }

  const otp = await readVerificationCodeFromStore(email);
  const verifyRes = await request.post("/api/applicant/auth/verify", {
    headers: csrfHeaders,
    data: { email, otp },
  });
  if (!verifyRes.ok()) {
    throw new Error(`verify failed: ${verifyRes.status()} ${await verifyRes.text()}`);
  }

  const applicantId = await readApplicantIdFromStore(email);
  return { email, password, applicantId };
}

export { getCsrfHeaders };

/** Registers and OTP-verifies a fresh applicant through the real UI (not
 * the API, unlike registerAndVerifyApplicant above), landing on
 * /apply/portal/form with a real browser session. Extracted from a
 * duplicated register/verify block that had accreted across e2e/file-
 * upload.spec.ts and e2e/accessibility.spec.ts. */
export async function registerAndVerifyApplicantViaBrowser(
  page: Page,
  opts?: { fullName?: string; emailPrefix?: string },
): Promise<{ email: string; password: string }> {
  const email = `${opts?.emailPrefix ?? "e2e"}-${Date.now()}-${Math.random().toString(36).slice(2)}@nextway.edu.lk`;
  const password = "Str0ngE2ETestPassw0rd!";
  const fullName = opts?.fullName ?? "E2E Test Applicant";

  await page.goto("/apply/register");
  await page.getByLabel(/full name/i).fill(fullName);
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/mobile phone/i).fill("0771234567");
  await page.getByLabel(/create password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL(/\/apply\/verify/, { timeout: 10000 });

  const otp = await readVerificationCodeFromStore(email);
  await page.getByLabel(/verification code/i).fill(otp);
  await page.getByRole("button", { name: /verify email/i }).click();
  await page.waitForURL(/\/apply\/portal\/form/, { timeout: 10000 });

  return { email, password };
}
