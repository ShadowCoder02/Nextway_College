import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only code. This app's auth model is
 * custom cookie-based sessions (see src/lib/admin/session.ts,
 * src/lib/admissions/session.ts), not Supabase Auth, so RLS policies
 * keyed on auth.uid() don't apply here — the service role key bypasses
 * RLS entirely, and requireAdmin()/getApplicantSession() are what
 * actually authorize each call site. Never import this from client code
 * or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient() requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isAdminClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
