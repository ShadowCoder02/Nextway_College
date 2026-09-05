import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getAllApplicationsAdmin } from "@/services/admissions";
import type { ApplicationStatus } from "@/types/admissions";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const status = (searchParams.get("status") as ApplicationStatus) || undefined;
  const programmeId = searchParams.get("programmeId") || undefined;
  const intake = searchParams.get("intake") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "15", 10);

  const result = await getAllApplicationsAdmin({
    q,
    status,
    programmeId,
    intake,
    page,
    pageSize,
  });

  return NextResponse.json({ ok: true, ...result });
}
