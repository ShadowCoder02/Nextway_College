import { readFileSync } from "fs";
import path from "path";
import type { APIRequestContext } from "@playwright/test";

const ADMISSIONS_STORE_PATH = path.join(__dirname, "..", "data", "cms", "admissions.json");

/**
 * Reads the applicant's OTP straight out of the CMS JSON store rather than
 * relying on the API response's `debugOtp` field — that field is only
 * present when NODE_ENV !== "production" (see src/services/admissions.ts),
 * and these tests deliberately run against a production build (matching
 * the Lighthouse CI decision — see playwright.config.ts). The OTP is
 * stored in plaintext (unlike the password-reset token, which is only
 * ever stored as a SHA-256 hash — see e2e/security.spec.ts for where that
 * distinction blocks a fully-automatable password-reset E2E test).
 */
export function readVerificationCodeFromStore(email: string): string {
  const store = JSON.parse(readFileSync(ADMISSIONS_STORE_PATH, "utf-8"));
  const applicant = store.applicants.find((a: { email: string }) => a.email === email);
  if (!applicant?.verificationCode) {
    throw new Error(`No pending verificationCode found in the store for ${email}`);
  }
  return applicant.verificationCode;
}

export function readApplicantIdFromStore(email: string): string {
  const store = JSON.parse(readFileSync(ADMISSIONS_STORE_PATH, "utf-8"));
  const applicant = store.applicants.find((a: { email: string }) => a.email === email);
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

  const otp = readVerificationCodeFromStore(email);
  const verifyRes = await request.post("/api/applicant/auth/verify", {
    headers: csrfHeaders,
    data: { email, otp },
  });
  if (!verifyRes.ok()) {
    throw new Error(`verify failed: ${verifyRes.status()} ${await verifyRes.text()}`);
  }

  const applicantId = readApplicantIdFromStore(email);
  return { email, password, applicantId };
}

export { getCsrfHeaders };
