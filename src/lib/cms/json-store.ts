import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

/**
 * Shared JSON read/write for the CMS "database" (admissions, programmes,
 * news, events, careers, enquiries). Replaces the original Vercel
 * Blob-backed version (src/lib/cms/blob-json-store.ts) after that store's
 * billing was suspended and the user opted not to pay for it — this reuses
 * the same one-JSON-document-per-collection shape, just persisted as a row
 * in a `kv_store` table (see supabase/migrations) instead of a Blob.
 *
 * Not a real relational database: still a single JSON document per
 * collection, still a plain read-modify-write with no locking (the same
 * lost-update risk under concurrent writers the Blob and fs versions
 * before it always had).
 */
export function isJsonStoreConfigured(): boolean {
  return isAdminClientConfigured();
}

/**
 * Distinguishes "not configured here" (vitest, CI's build job, unconfigured
 * local dev — none set SUPABASE_SERVICE_ROLE_KEY) from "configured but this
 * call genuinely failed". The former must degrade gracefully for READS so
 * read-only test suites and unconfigured local dev keep working against
 * seed/empty fallback data. A real query error (network, auth, a broken
 * table) throws instead of silently returning the fallback: a
 * read-modify-write caller (see admissions-store.ts) that got an empty
 * fallback here would then write that empty object back and wipe every
 * real record over a transient read glitch.
 */
export async function readJsonRecord<T>(key: string, fallback: T): Promise<T> {
  if (!isJsonStoreConfigured()) return fallback;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kv_store")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(`Failed to read kv_store/${key}: ${error.message}`);
  if (!data) return fallback;
  return data.data as T;
}

/**
 * Unlike readJsonRecord, a write has no safe silent-failure mode: a caller
 * that thinks a write succeeded (e.g. registerApplicant returning {ok:true}
 * to the client) when nothing was actually persisted is worse than an
 * honest error. So this always throws when not configured, rather than a
 * silent no-op; callers with a genuinely optional, best-effort write (e.g.
 * store.ts's version-mismatch reseed cache) are responsible for catching
 * that themselves.
 */
export async function writeJsonRecord<T>(key: string, value: T): Promise<void> {
  if (!isJsonStoreConfigured()) {
    throw new Error(
      `Cannot write kv_store/${key}: Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). This write cannot be silently skipped without lying to the caller about whether it persisted.`,
    );
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, data: value as object, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Failed to write kv_store/${key}: ${error.message}`);
}
