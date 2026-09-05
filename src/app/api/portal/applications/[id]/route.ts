import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getApplicationByIdAdmin } from "@/services/admissions";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await getApplicationByIdAdmin(id);

  if (!application) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application });
}
