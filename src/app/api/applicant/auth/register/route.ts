import { NextResponse } from "next/server";
import { applicantRegisterSchema } from "@/lib/validation";
import { registerApplicant } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

const REGISTER_LIMIT = 10;
const TURNSTILE_AFTER_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`register_${ip}`, REGISTER_LIMIT, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many registration attempts. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Only required once several attempts have already been made from this
    // IP, and only if Turnstile is actually configured — otherwise inert.
    const attemptsUsed = REGISTER_LIMIT - limit.remaining;
    if (isTurnstileConfigured() && attemptsUsed >= TURNSTILE_AFTER_ATTEMPTS) {
      const validCaptcha = await verifyTurnstileToken(body?.turnstileToken, ip);
      if (!validCaptcha) {
        return NextResponse.json(
          { ok: false, error: "Please complete the verification challenge and try again." },
          { status: 400 },
        );
      }
    }

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
