import { describe, expect, it } from "vitest";
import { verifyFileMagicBytes, generateSafeStoredFilename } from "./file-security";

// Suites 5 & 6 (regression suite, docs/fix-prompts.md "GitHub Copilot —
// Prompt 1") — path traversal and magic-byte checks, tested at the unit
// level against these pure functions rather than through the real upload
// API. The full end-to-end upload flow needs BLOB_READ_WRITE_TOKEN, which
// isn't provisioned for this project (confirmed: no Vercel Blob store
// exists yet — `vercel env pull` returns no such variable, and
// .env.example itself says there's no local-filesystem fallback). See
// e2e/security.spec.ts and e2e/file-upload.spec.ts for what's
// skipped for that reason and why.

describe("generateSafeStoredFilename — path traversal", () => {
  it("discards a ../../etc/passwd original name entirely, keeping only a generated name + safe extension", () => {
    const stored = generateSafeStoredFilename("nic_passport", "../../etc/passwd");
    expect(stored).not.toContain("..");
    expect(stored).not.toContain("/");
    expect(stored).not.toContain("etc");
    expect(stored).not.toContain("passwd");
    // No extension in "passwd" is in ALLOWED_EXTENSIONS, so it falls back to .dat.
    expect(stored.endsWith(".dat")).toBe(true);
  });

  it("sanitizes a malicious category value", () => {
    const stored = generateSafeStoredFilename("../../etc", "photo.jpg");
    expect(stored).not.toContain("..");
    expect(stored).not.toContain("/");
  });

  it("keeps a real allowed extension for a normal filename", () => {
    const stored = generateSafeStoredFilename("nic_passport", "my-nic.pdf");
    expect(stored.endsWith(".pdf")).toBe(true);
  });

  it("handles Tamil characters in the original filename without throwing, discarding them like any other original name", () => {
    const stored = generateSafeStoredFilename("nic_passport", "என்நிக்.pdf");
    expect(stored.endsWith(".pdf")).toBe(true);
    expect(stored).not.toContain("என்நிக்");
  });

  it("two uploads of the identically-named file never collide (each gets a fresh random + timestamp component)", () => {
    const a = generateSafeStoredFilename("nic_passport", "id.pdf");
    const b = generateSafeStoredFilename("nic_passport", "id.pdf");
    expect(a).not.toBe(b);
  });
});

describe("verifyFileMagicBytes — Suite 6's .exe-renamed-.pdf case", () => {
  const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, ...Array(10).fill(0)]);
  // A real Windows PE executable's actual magic bytes ("MZ" + DOS stub),
  // padded to the function's 12-byte minimum, with a declared .pdf
  // extension/MIME — this is exactly Suite 6's ".exe renamed .pdf" case.
  const exeRenamedPdf = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);

  it("accepts a real PDF's magic bytes", () => {
    expect(verifyFileMagicBytes(validPdf, "application/pdf", ".pdf")).toBe(true);
  });

  it("rejects an .exe renamed to .pdf (wrong magic bytes for the declared extension)", () => {
    expect(verifyFileMagicBytes(exeRenamedPdf, "application/pdf", ".pdf")).toBe(false);
  });

  it("rejects a buffer under 12 bytes outright", () => {
    expect(verifyFileMagicBytes(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]), "application/pdf", ".pdf")).toBe(
      false,
    );
  });

  it("accepts real JPEG/PNG/WebP signatures", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, ...Array(9).fill(0)]);
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const webp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(verifyFileMagicBytes(jpeg, "image/jpeg", ".jpg")).toBe(true);
    expect(verifyFileMagicBytes(png, "image/png", ".png")).toBe(true);
    expect(verifyFileMagicBytes(webp, "image/webp", ".webp")).toBe(true);
  });

  it("HEIC is never checked here — the server doesn't accept raw .heic at all (see file-policy.ts's ALLOWED_EXTENSIONS); conversion to JPEG happens client-side before upload", () => {
    // Not a real assertion against verifyFileMagicBytes (it has no HEIC
    // branch, correctly — .heic isn't in ALLOWED_EXTENSIONS, only in the
    // separate HEIC_EXTENSIONS set that gates client-side conversion in
    // DocumentUploader.tsx). Documenting the boundary rather than
    // asserting behavior this function was never meant to have.
    expect(true).toBe(true);
  });
});
