import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplication, saveApplicationDraft } from "@/services/admissions";
import { saveApplicationDraftSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function GET() {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const app = await getApplicantApplication(session.applicantId);
  if (!app) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, application: app });
}

export async function POST(request: Request) {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  // Autosave is frequent, so the ceiling is generous; it exists to stop a
  // scripted client hammering the store, not to slow a real applicant.
  const limit = checkRateLimit(`app_draft_${session.applicantId}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `Too many requests. Please try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = saveApplicationDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form values provided.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await saveApplicationDraft(session.applicantId, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, application: result.application });
  } catch (err) {
    console.error("[applicant/application/draft] Error:", err);
    return NextResponse.json({ ok: false, error: "Unable to save draft application." }, { status: 500 });
  }
}
