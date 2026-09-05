import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { uploadApplicationDocument, deleteApplicationDocument } from "@/services/admissions";
import type { DocumentCategory } from "@/types/admissions";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`upload_${session.applicantId}`, 30, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many upload requests. Please wait a moment." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as DocumentCategory | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided for upload." }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ ok: false, error: "Document category is required." }, { status: 400 });
    }

    const result = await uploadApplicationDocument(
      session.applicantId,
      category,
      title || category,
      file,
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      document: result.document,
      application: result.application,
    });
  } catch (err) {
    console.error("[applicant/documents/upload] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to upload document." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getApplicantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let documentId = searchParams.get("id");

    if (!documentId) {
      const body = await request.json().catch(() => ({}));
      documentId = body.documentId;
    }

    if (!documentId) {
      return NextResponse.json({ ok: false, error: "Document ID is required." }, { status: 400 });
    }

    const result = await deleteApplicationDocument(session.applicantId, documentId);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, application: result.application });
  } catch (err) {
    console.error("[applicant/documents/delete] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete document." }, { status: 500 });
  }
}
