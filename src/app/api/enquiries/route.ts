import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { submitEnquiry } from "@/services/enquiries";

export async function POST(request: Request) {
  try {
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
