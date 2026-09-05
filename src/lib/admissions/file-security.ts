import crypto from "crypto";
import path from "path";
import { put, del, get } from "@vercel/blob";
import { ALLOWED_EXTENSIONS } from "./file-policy";

export { MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "./file-policy";

const BLOB_PATH_PREFIX = "applications";

/**
 * Checks magic byte signatures for uploaded buffers
 */
export function verifyFileMagicBytes(buffer: Buffer, mimeType: string, extension: string): boolean {
  if (buffer.length < 12) return false;

  const ext = extension.toLowerCase();

  // PDF: %PDF-
  if (ext === ".pdf" || mimeType === "application/pdf") {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    );
  }

  // JPEG: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg" || mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (ext === ".png" || mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // WebP: RIFF .... WEBP
  if (ext === ".webp" || mimeType === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

/**
 * Sanitizes original filename and generates a safe server-side storage filename
 */
export function generateSafeStoredFilename(category: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".dat";
  const randomHex = crypto.randomBytes(12).toString("hex");
  const sanitizedCategory = category.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  return `${sanitizedCategory}_${Date.now()}_${randomHex}${safeExt}`;
}

function buildBlobPathname(applicationId: string, storedFilename: string): string {
  const sanitizedAppId = applicationId.replace(/[^a-z0-9_-]/gi, "");
  return `${BLOB_PATH_PREFIX}/${sanitizedAppId}/${storedFilename}`;
}

// The local-filesystem version of this file confined every read/delete to
// UPLOADS_ROOT before touching disk. Nothing currently passes readStoredFile/
// deleteStoredFile anything but a pathname this module generated itself, but
// keep the same backstop here too: never act on a pathname outside the
// applications/ prefix, in case a future caller or a corrupted record ever
// does.
function isConfinedPathname(pathname: string): boolean {
  return pathname === BLOB_PATH_PREFIX || pathname.startsWith(`${BLOB_PATH_PREFIX}/`);
}

/**
 * Uploads a file buffer to private Vercel Blob storage. Returns the blob
 * pathname (not a public URL) — the only way to read it back is via
 * readStoredFile() below, which requires the same store credentials this
 * server process already has. Never expose this pathname to the client;
 * documents are served through an authenticated proxy route instead of a
 * direct link, so a logged-out request for a stored document always fails.
 */
export async function saveUploadedFile(
  applicationId: string,
  storedFilename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const pathname = buildBlobPathname(applicationId, storedFilename);
  const result = await put(pathname, buffer, {
    access: "private",
    contentType: mimeType,
  });
  return result.pathname;
}

/**
 * Reads a stored file back from private Blob storage.
 */
export async function readStoredFile(pathname: string): Promise<Buffer | null> {
  if (!isConfinedPathname(pathname)) return null;
  try {
    const result = await get(pathname, { access: "private" });
    if (!result) return null;
    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Deletes a stored file from Blob storage.
 */
export async function deleteStoredFile(pathname: string): Promise<boolean> {
  if (!isConfinedPathname(pathname)) return false;
  try {
    await del(pathname);
    return true;
  } catch {
    return false;
  }
}
