import { NextResponse } from "next/server";
import { getProgrammes } from "@/services/programmes";

/**
 * Public, unauthenticated — programme data is already shown to anyone on
 * /programmes. Exists for client components (e.g. the applicant's
 * multi-step form) that need the catalog client-side and can't call the
 * server-only service function directly. Returns a bare array, not
 * { programmes: [...] } like the staff-only admin/portal routes, since
 * those two are a different, unrelated API surface (CMS management, not
 * public catalog reads) and callers here shouldn't need to know about them.
 */
export async function GET() {
  const programmes = await getProgrammes();
  return NextResponse.json(programmes);
}
