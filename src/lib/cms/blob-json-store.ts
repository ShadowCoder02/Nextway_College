import { put, get } from "@vercel/blob";

/**
 * Shared JSON-blob read/write for the CMS "database" (admissions, programmes,
 * news, events, careers, enquiries). Replaces the original fs.readFile/
 * writeFile version, which wrote into process.cwd()/data/cms — the deployed
 * app bundle's own directory, read-only on Vercel's serverless runtime
 * (confirmed in production: EROFS on every write). Same private-Blob
 * conventions as src/lib/admissions/file-security.ts's document storage.
 *
 * Not a real database: still a single JSON blob per collection, still a
 * plain read-modify-write with no locking (the same lost-update risk under
 * concurrent writers the fs version always had). Chosen as the fast fix to
 * stop production writes failing outright; a real relational store is a
 * separate, larger piece of work.
 */
const BLOB_PATH_PREFIX = "cms";

// Distinguishes "Blob isn't configured here" (vitest — vitest.config.mts
// doesn't load .env.local, and no BLOB_READ_WRITE_TOKEN is set as a GitHub
// Actions secret either — plus any local dev without a linked store) from
// "Blob is configured but this call genuinely failed". The former must
// degrade gracefully (same spirit as mailer.ts falling back to
// streamTransport when SMTP isn't configured, or isSupabaseConfigured()
// gating the enquiries Supabase path) so the test suite and unconfigured
// local dev keep working against the in-memory fallback. The latter must
// NOT be swallowed: a real write failure in production has to propagate to
// the caller's try/catch and surface as an honest error, not a silent no-op
// that tells an applicant their registration succeeded when nothing was
// actually persisted.
function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readJsonBlob<T>(file: string, fallback: T): Promise<T> {
  if (!isBlobConfigured()) return fallback;
  try {
    const result = await get(`${BLOB_PATH_PREFIX}/${file}`, { access: "private", useCache: false });
    if (!result || !result.stream) return fallback;
    const text = await new Response(result.stream).text();
    if (!text.trim()) return fallback;
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  } catch {
    return fallback;
  }
}

export async function writeJsonBlob<T>(file: string, data: T): Promise<void> {
  if (!isBlobConfigured()) return;
  await put(`${BLOB_PATH_PREFIX}/${file}`, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
