import { NextResponse } from "next/server";
import { z } from "zod";
import { resendVerificationOtp } from "@/services/admissions";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
