import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { requestPasswordReset } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    // Rate limit per IP and per email — a neutral response either way, so
    // the limiter is the only thing standing between this and an email-bomb.
    const ipLimit = checkRateLimit(`forgot_ip_${ip}`, 10, 60 * 1000);
    const emailLimit = checkRateLimit(`forgot_email_${parsed.data.email}`, 3, 15 * 60 * 1000);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const result = await requestPasswordReset(parsed.data.email);
    return NextResponse.json({ ok: true, message: result.message, debugToken: result.debugToken });
  } catch (err) {
    console.error("[applicant/forgot-password] Error:", err);
    return NextResponse.json({ ok: false, error: "Unable to process this request right now." }, { status: 500 });
  }
}
