import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { submitApplication } from "@/services/admissions";
import { submitApplicationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = submitApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Please complete all required fields.",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const result = await submitApplication(session.applicantId, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, application: result.application });
  } catch (err) {
    console.error("[applicant/application/submit] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to process application submission. Please try again." },
      { status: 500 },
    );
  }
}
