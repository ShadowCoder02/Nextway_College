import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { updateApplicationStatusAdmin } from "@/services/admissions";
import { updateStatusSchema } from "@/lib/validation";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid status update data", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const staffName = "Admissions Staff";
    const updated = await updateApplicationStatusAdmin(
      id,
      parsed.data.status,
      staffName,
      parsed.data.notes,
    );

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch (err) {
    console.error("[portal/applications/status] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update status." }, { status: 500 });
  }
}
