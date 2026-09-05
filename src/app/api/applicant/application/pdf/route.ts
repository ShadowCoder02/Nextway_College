import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplication } from "@/services/admissions";
import { generateApplicationPdf } from "@/lib/admissions/pdf";

export async function GET() {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const app = await getApplicantApplication(session.applicantId);
  if (!app) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  const pdfBuffer = await generateApplicationPdf(app);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${app.applicationNumber}.pdf"`,
    },
  });
}
