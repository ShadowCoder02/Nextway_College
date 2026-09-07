import { test, expect } from "@playwright/test";
import { registerAndVerifyApplicantViaBrowser } from "./helpers";
import { writeFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";

// Suite 6 — File upload (regression suite, docs/fix-prompts.md "GitHub
// Copilot — Prompt 1"). Several items in this suite need a real, completed
// upload to Vercel Blob storage, which needs BLOB_READ_WRITE_TOKEN — not
// provisioned for this project (confirmed via `npx vercel env pull`
// returning no such variable, and .env.example's own note that there's no
// local-filesystem fallback). Those are explicitly skipped below with
// their code-review-based finding instead of silently omitted. What
// doesn't need a completed upload — client-side validation before the
// request is even sent, and the magic-byte/path-traversal checks — is
// fully tested (the latter as unit tests in
// src/lib/admissions/file-security.test.ts).

async function loginViaBrowser(page: import("@playwright/test").Page) {
  await registerAndVerifyApplicantViaBrowser(page, { fullName: "E2E Upload Tester", emailPrefix: "e2e-upload" });
}

test("50MB file is rejected client-side before any upload request is sent", async ({ page }) => {
  await loginViaBrowser(page);
  await page.goto("/apply/portal/form?step=4");

  let uploadRequestFired = false;
  page.on("request", (req) => {
    if (req.url().includes("/api/applicant/application/documents") && req.method() === "POST") {
      uploadRequestFired = true;
    }
  });

  // Playwright's setInputFiles rejects an inline buffer this large ("write
  // it to a file and pass its path instead") — writing a real 50MB temp
  // file rather than shrinking the case to fit the API.
  const tmpDir = mkdtempSync(path.join(tmpdir(), "e2e-upload-"));
  const hugeFilePath = path.join(tmpDir, "huge.pdf");
  try {
    writeFileSync(hugeFilePath, Buffer.alloc(50 * 1024 * 1024, 1));

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(hugeFilePath);

    await expect(page.getByText(/exceeds the 5MB size limit/i)).toBeVisible();
    expect(uploadRequestFired, "a 50MB file should never reach the server").toBe(false);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("a 0-byte file is rejected client-side", async ({ page }) => {
  await loginViaBrowser(page);
  await page.goto("/apply/portal/form?step=4");

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "empty.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(0),
  });

  await expect(page.getByText(/empty \(0 bytes\)/i)).toBeVisible();
});

test("a Tamil-scripted filename is accepted by client-side checks (no filename-based rejection exists)", async ({
  page,
}) => {
  await loginViaBrowser(page);
  await page.goto("/apply/portal/form?step=4");

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "என்நிக்.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\ntest\n"),
  });

  // No client-side filename validation exists, so the file proceeds to the
  // (Blob-backed) upload step rather than being rejected for its name —
  // confirmed by it NOT showing a client-side validation error message.
  await expect(page.getByText(/is empty|exceeds the|not a supported format/i)).not.toBeVisible();
});

test("a connection drop mid-upload shows a clear retry option, not a hang", async ({ page }) => {
  await loginViaBrowser(page);
  await page.goto("/apply/portal/form?step=4");

  // Simulate a dropped connection by aborting the upload request at the
  // network level — this is exactly the failure mode
  // src/components/applicant/DocumentUploader.tsx's catch block (a thrown
  // fetch/XHR error, not a well-formed error response) is written for, and
  // doesn't depend on Blob credentials since the request never completes.
  await page.route("**/api/applicant/application/documents", (route) => route.abort("connectionreset"));

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: "id.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\ntest\n"),
  });

  await expect(page.getByText(/connection dropped/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /retry upload/i })).toBeVisible();
});

// SKIPPED, not silently passed — see the file-level comment for why.
test.skip(
  "2MB PDF accepted with preview — needs BLOB_READ_WRITE_TOKEN (not provisioned)",
  async () => {},
);

// GAP, based on source review (src/components/applicant/DocumentUploader.tsx
// and src/services/admissions.ts's uploadApplicationDocument): no cap on
// documents per category exists client-side or server-side. Marked
// test.fail() with a source-review-based assertion of the property the
// spec wants, rather than silently reporting via a comment only — but the
// automated E2E form of this (upload 6 real files, assert the 6th is
// rejected) is blocked by the same Blob gap, so this exercises the review
// finding as a permanently-failing regression trip-wire instead: if a cap
// is ever added, this test starts passing and needs promoting out of
// test.fail().
test("GAP: a 6th document to the same category is rejected when the limit is five (no cap exists — confirmed by source review, not a live upload)", async () => {
  test.fail();
  throw new Error(
    "No per-category document count cap exists anywhere: DocumentUploader.tsx's matchingDocs.length is only " +
      "used to change the button label, and uploadApplicationDocument() in src/services/admissions.ts has no " +
      "count check before appending. Not verified via a live 6-upload sequence (blocked by the same " +
      "BLOB_READ_WRITE_TOKEN gap as the skipped test above) — this documents the source-level finding.",
  );
});

test("GAP: uploading the same filename twice replaces rather than duplicates (it currently always duplicates — confirmed by source review, not a live upload)", async () => {
  test.fail();
  throw new Error(
    "generateSafeStoredFilename() (src/lib/admissions/file-security.ts) always generates a fresh " +
      "timestamp+random filename regardless of the original name, so the 'replace if same storedFilename' " +
      "branch in addApplicationDocument() (src/lib/cms/admissions-store.ts) can never match — every upload, " +
      "even of an identically-named file to the same category, is appended as a new separate document. Not " +
      "verified via two live uploads (blocked by the same BLOB_READ_WRITE_TOKEN gap) — this documents the " +
      "source-level finding.",
  );
});
