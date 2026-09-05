import { NextResponse } from "next/server";
import { applicantLoginSchema } from "@/lib/validation";
import { authenticateApplicant } from "@/services/admissions";
import { createApplicantSession } from "@/lib/admissions/session";
import { checkRateLimit, resetRateLimit } from "@/lib/admissions/rate-limiter";
import { isTurnstileConfigured, verifyTurnstileToken, TURNSTILE_AFTER_ATTEMPTS } from "@/lib/turnstile";

const LOGIN_LIMIT = 8;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`login_${ip}`, LOGIN_LIMIT, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many login attempts. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();

    const attemptsUsed = LOGIN_LIMIT - limit.remaining;
    if (isTurnstileConfigured() && attemptsUsed >= TURNSTILE_AFTER_ATTEMPTS) {
      const validCaptcha = await verifyTurnstileToken(body?.turnstileToken, ip);
      if (!validCaptcha) {
        return NextResponse.json(
          { ok: false, error: "Please complete the verification challenge and try again." },
          { status: 400 },
        );
      }
    }

    const parsed = applicantLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email and password." },
        { status: 400 },
      );
    }

    const result = await authenticateApplicant(parsed.data.email, parsed.data.password);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }

    resetRateLimit(`login_${ip}`);
    await createApplicantSession(result.session);

    return NextResponse.json({
      ok: true,
      applicant: {
        id: result.applicant.id,
        email: result.applicant.email,
        fullName: result.applicant.fullName,
      },
    });
  } catch (err) {
    console.error("[applicant/login] Error:", err);
    return NextResponse.json({ ok: false, error: "Authentication service temporarily unavailable." }, { status: 500 });
  }
}
