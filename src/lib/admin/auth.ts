import { createClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { isSupabaseConfigured } from "@/lib/cms/store";

export async function requireAdmin() {
  if (await isAdminAuthenticated()) {
    return { ok: true as const, mode: "local" as const };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return { ok: true as const, mode: "supabase" as const, user };
  }

  return { ok: false as const };
}
