import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/account-validation";
import { resetPasswordWithToken } from "@/services/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`reset_ip_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid request." },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[applicant/reset-password] Error:", err);
    return NextResponse.json({ ok: false, error: "Unable to reset your password right now." }, { status: 500 });
  }
}
