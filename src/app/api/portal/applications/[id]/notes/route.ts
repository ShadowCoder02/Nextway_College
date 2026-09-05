import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addAdminNoteToApplication } from "@/services/admissions";
import { addAdminNoteSchema } from "@/lib/validation";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addAdminNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please enter note text", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const staffName = "Admissions Staff";
    const updated = await addAdminNoteToApplication(
      id,
      parsed.data.note,
      staffName,
      parsed.data.isInternal,
    );

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch (err) {
    console.error("[portal/applications/notes] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to add note." }, { status: 500 });
  }
}
