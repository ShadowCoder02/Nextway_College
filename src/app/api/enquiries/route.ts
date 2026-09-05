import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { submitEnquiry } from "@/services/enquiries";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const limit = checkRateLimit(`enquiry_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many submissions. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await submitEnquiry(parsed.data);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
