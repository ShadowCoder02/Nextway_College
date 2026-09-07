import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getApplicationByIdAdmin } from "@/services/admissions";
import { generateApplicationPdf } from "@/lib/admissions/pdf";

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

  const pdfBuffer = await generateApplicationPdf(application);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${application.applicationNumber}.pdf"`,
    },
  });
}
