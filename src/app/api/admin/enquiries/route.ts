import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getEnquiries, updateEnquiryStatus } from "@/services/enquiries";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enquiries = await getEnquiries();
  return NextResponse.json({ enquiries });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const ok = await updateEnquiryStatus(id, status);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
