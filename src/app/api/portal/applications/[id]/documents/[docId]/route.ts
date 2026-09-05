import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getApplicationByIdAdmin, verifyDocumentAdmin } from "@/services/admissions";
import { verifyDocumentSchema } from "@/lib/validation";
import { readStoredFile } from "@/lib/admissions/file-security";

type Props = { params: Promise<{ id: string; docId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id, docId } = await params;
  const app = await getApplicationByIdAdmin(id);
  if (!app) {
    return new NextResponse("Application not found", { status: 404 });
  }

  const doc = app.documents.find((d) => d.id === docId);
  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  const buffer = await readStoredFile(doc.filePath);
  if (!buffer) {
    return new NextResponse("File missing on server", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Length": buffer.length.toString(),
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalFilename)}"`,
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, docId } = await params;
    const body = await request.json();
    const parsed = verifyDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid verification data", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const staffName = "Document Verifier";
    const updated = await verifyDocumentAdmin(
      id,
      docId,
      parsed.data.status,
      parsed.data.rejectionReason,
      staffName,
    );

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Document or Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch (err) {
    console.error("[portal/applications/documents] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update document verification." }, { status: 500 });
  }
}
