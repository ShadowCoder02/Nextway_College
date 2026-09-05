import { NextResponse } from "next/server";
import { z } from "zod";
import { resendVerificationOtp } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const body = await request.json();
    const emailForLimit = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "unknown";
    const ipLimit = checkRateLimit(`resend_otp_ip_${ip}`, 10, 60 * 1000);
    const emailLimit = checkRateLimit(`resend_otp_email_${emailForLimit}`, 5, 15 * 60 * 1000);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
    }

    const result = await resendVerificationOtp(parsed.data.email);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: result.message });
  } catch (error) {
    console.error("[applicant/auth/resend-otp] Error:", error);
    return NextResponse.json({ ok: false, error: "Unable to send a new verification code." }, { status: 500 });
  }
}
