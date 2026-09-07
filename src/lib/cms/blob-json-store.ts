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
// degrade gracefully for READS (same spirit as mailer.ts falling back to
// streamTransport when SMTP isn't configured, or isSupabaseConfigured()
// gating the enquiries Supabase path) so read-only test suites and
// unconfigured local dev keep working against seed/empty fallback data.
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * A `get()` returning null/no-stream is the SDK's normal "not found" signal
 * (per its own return type, `GetBlobResult | null`) — that's the only case
 * that should fall back silently. A THROWN error is a real failure (network,
 * auth, rate limit) and must propagate, not be treated as "not found": a
 * read-modify-write caller (see admissions-store.ts) that silently got an
 * empty fallback here would then write that empty object back and wipe
 * every real record over a transient read glitch.
 */
export async function readJsonBlob<T>(file: string, fallback: T): Promise<T> {
  if (!isBlobConfigured()) return fallback;
  const result = await get(`${BLOB_PATH_PREFIX}/${file}`, { access: "private", useCache: false });
  if (!result || !result.stream) return fallback;
  const text = await new Response(result.stream).text();
  if (!text.trim()) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Unlike readJsonBlob, a write has no safe silent-failure mode: a caller
 * that thinks a write succeeded (e.g. registerApplicant returning {ok:true}
 * to the client) when nothing was actually persisted is worse than an
 * honest error — the applicant is told they registered, then can't verify
 * or log in because the record was never saved. So this always throws when
 * Blob isn't configured, rather than a silent no-op; callers that have a
 * genuinely optional, best-effort write (e.g. store.ts's version-mismatch
 * reseed cache) are responsible for catching that themselves.
 */
export async function writeJsonBlob<T>(file: string, data: T): Promise<void> {
  if (!isBlobConfigured()) {
    throw new Error(
      `Cannot write ${BLOB_PATH_PREFIX}/${file}: BLOB_READ_WRITE_TOKEN is not set. This write cannot be silently skipped without lying to the caller about whether it persisted.`,
    );
  }
  await put(`${BLOB_PATH_PREFIX}/${file}`, JSON.stringify(data, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
