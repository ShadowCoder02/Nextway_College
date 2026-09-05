import { NextResponse } from "next/server";
import { applicantRegisterSchema } from "@/lib/validation";
import { registerApplicant } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many registration attempts. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = applicantRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid registration input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await registerApplicant(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      debugOtp: result.debugOtp,
      applicant: {
        id: result.applicant.id,
        email: result.applicant.email,
        fullName: result.applicant.fullName,
      },
    });
  } catch (err) {
    console.error("[applicant/register] Error:", err);
    return NextResponse.json({ ok: false, error: "Unable to process registration at this time." }, { status: 500 });
  }
}
