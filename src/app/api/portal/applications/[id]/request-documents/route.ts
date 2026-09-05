import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { requestDocumentsAdmin } from "@/services/admissions";
import { requestDocumentsSchema } from "@/lib/validation";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = requestDocumentsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please enter instructions for the requested documents", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const staffName = "Admissions Officer";
    const updated = await requestDocumentsAdmin(id, parsed.data.notes, staffName);

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch (err) {
    console.error("[portal/applications/request-documents] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to submit document request." }, { status: 500 });
  }
}
