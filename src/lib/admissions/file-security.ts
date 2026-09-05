import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const UPLOADS_ROOT = path.join(process.cwd(), "data", "uploads", "applications");

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

/**
 * Ensures application upload directory exists and is strictly isolated
 */
export async function getApplicationUploadDir(applicationId: string): Promise<string> {
  const sanitizedAppId = applicationId.replace(/[^a-z0-9_-]/gi, "");
  const targetDir = path.resolve(UPLOADS_ROOT, sanitizedAppId);

  // Guard against path traversal outside UPLOADS_ROOT
  if (!targetDir.startsWith(path.resolve(UPLOADS_ROOT))) {
    throw new Error("Invalid application upload path traversal detected");
  }

  await fs.mkdir(targetDir, { recursive: true });
  return targetDir;
}

/**
 * Saves an uploaded file buffer safely to disk outside the public web root
 */
export async function saveUploadedFile(
  applicationId: string,
  storedFilename: string,
  buffer: Buffer,
): Promise<string> {
  const appDir = await getApplicationUploadDir(applicationId);
  const filePath = path.resolve(appDir, storedFilename);

  if (!filePath.startsWith(appDir)) {
    throw new Error("Invalid file path traversal detected");
  }

  await fs.writeFile(filePath, buffer);
  return filePath;
}

/**
 * Reads a stored file securely, verifying path boundaries
 */
export async function readStoredFile(filePath: string): Promise<Buffer | null> {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOADS_ROOT))) {
    return null;
  }
  try {
    return await fs.readFile(resolved);
  } catch {
    return null;
  }
}

/**
 * Deletes a stored file securely
 */
export async function deleteStoredFile(filePath: string): Promise<boolean> {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOADS_ROOT))) {
    return false;
  }
  try {
    await fs.unlink(resolved);
    return true;
  } catch {
    return false;
  }
}
