import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplication } from "@/services/admissions";
import { buildApplicationPdfResponse } from "@/lib/admissions/pdf-response";

export async function GET() {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const app = await getApplicantApplication(session.applicantId);
  if (!app) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  return buildApplicationPdfResponse(app);
}
