import { NextResponse } from "next/server";
import { z } from "zod";
import { createApplicantSession } from "@/lib/admissions/session";
import { verifyApplicantOtp } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`verify_otp_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many attempts. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email and 6-digit OTP." }, { status: 400 });
    }

    const result = await verifyApplicantOtp(parsed.data.email, parsed.data.otp);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    await createApplicantSession(result.session);

    return NextResponse.json({ ok: true, applicant: { id: result.applicant.id, email: result.applicant.email, fullName: result.applicant.fullName } });
  } catch (error) {
    console.error("[applicant/auth/verify] Error:", error);
    return NextResponse.json({ ok: false, error: "Unable to verify your account right now." }, { status: 500 });
  }
}
