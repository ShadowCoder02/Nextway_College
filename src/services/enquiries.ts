import type { EnquiryInput } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addStoredEnquiry,
  getStoredEnquiries,
  isSupabaseConfigured,
  updateStoredEnquiry,
  type StoredEnquiry,
} from "@/lib/cms/store";

export type EnquiryResult = { ok: true; id?: string } | { ok: false; error: string };

// Every function here uses the service-role admin client, not a cookie-
// bound anon-key client: this app never uses Supabase Auth (see
// src/lib/admin/session.ts's custom cookie sessions), so auth.uid() is
// always null and the enquiries table's auth.uid()-based RLS policies can
// never pass for any request — staff or public. Real authorization for
// these three functions' callers is enforced by requireAdmin() at the API
// route layer (see src/app/api/admin/enquiries/route.ts and
// src/app/api/portal/enquiries/route.ts) for the two staff-only functions,
// and by design for submitEnquiry (any visitor may submit an enquiry).
export async function submitEnquiry(data: EnquiryInput): Promise<EnquiryResult> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: row, error } = await supabase
        .from("enquiries")
        .insert({
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
          programme_id: data.programmeId ?? null,
          programme_title: data.programmeTitle ?? null,
          qualification: data.qualification ?? null,
          intake: data.intake ?? null,
          message: data.message ?? null,
          source: data.source ?? "website",
          status: "new",
          consent: data.consent,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[enquiry] Supabase error:", error.message);
        return { ok: false, error: "Unable to submit enquiry. Please try again or contact us directly." };
      }

      return { ok: true, id: row?.id };
    } catch (err) {
      console.error("[enquiry] Unexpected error:", err);
    }
  }

  try {
    const row = await addStoredEnquiry({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      programme_id: data.programmeId ?? null,
      programme_title: data.programmeTitle ?? null,
      qualification: data.qualification ?? null,
      intake: data.intake ?? null,
      message: data.message ?? null,
      source: data.source ?? "website",
      consent: data.consent,
    });
    return { ok: true, id: row.id };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again later." };
  }
}

export async function getEnquiries(): Promise<StoredEnquiry[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as StoredEnquiry[];
    } catch {
      // fall through to local store
    }
  }
  return getStoredEnquiries();
}

export async function updateEnquiryStatus(
  id: string,
  status: StoredEnquiry["status"],
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (!error) return true;
    } catch {
      // fall through
    }
  }
  const updated = await updateStoredEnquiry(id, { status });
  return Boolean(updated);
}

export type { StoredEnquiry };
