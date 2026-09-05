import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplication } from "@/services/admissions";
import { readStoredFile } from "@/lib/admissions/file-security";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const session = await getApplicantSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: docId } = await params;
  const app = await getApplicantApplication(session.applicantId);
  if (!app) {
    return new NextResponse("Application not found", { status: 404 });
  }

  const doc = app.documents.find((d) => d.id === docId);
  if (!doc) {
    // IDOR protection: Document does not exist or does not belong to this applicant
    return new NextResponse("Document not found", { status: 404 });
  }

  const buffer = await readStoredFile(doc.filePath);
  if (!buffer) {
    return new NextResponse("File data missing or inaccessible", { status: 404 });
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
