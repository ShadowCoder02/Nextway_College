import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantProfile } from "@/services/admissions";

export async function GET() {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const profile = await getApplicantProfile(session.applicantId);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    applicant: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      isVerified: profile.isVerified,
    },
  });
}
