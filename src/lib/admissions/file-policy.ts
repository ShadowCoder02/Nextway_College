/**
 * File upload limits shared between the client (DocumentUploader, a pre-
 * upload check) and the server (the real enforcement, in file-security.ts /
 * admissions.ts). Kept in its own zero-dependency module — file-security.ts
 * pulls in @vercel/blob and Node's crypto/path, neither safe to bundle into
 * a client component — so a future change to the limits can't silently
 * diverge between what the UI accepts and what the server actually allows.
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);
