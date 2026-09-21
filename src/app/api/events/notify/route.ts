import { NextResponse } from "next/server";
import { eventNotifySchema } from "@/lib/validation";
import { submitEnquiry } from "@/services/enquiries";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

/** "Notify me about upcoming events". Stored as an enquiry (source
 * "event-notify") so Admissions sees it in the existing enquiries inbox. */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limit = checkRateLimit(`event_notify_${ip}`, 5, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests. Please try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = eventNotifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form data", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await submitEnquiry({
      fullName: parsed.data.name ?? "Event notification subscriber",
      phone: "Not provided",
      email: parsed.data.email,
      message: "Please notify me about upcoming events and open days.",
      source: "event-notify",
      consent: true,
    });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
