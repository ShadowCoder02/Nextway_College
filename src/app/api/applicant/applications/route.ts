import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplications } from "@/services/admissions";

export async function GET() {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const applications = await getApplicantApplications(session.applicantId);
  return NextResponse.json({ ok: true, applications });
}
