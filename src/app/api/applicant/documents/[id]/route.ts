import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/admissions/session";
import { getApplicantApplications } from "@/services/admissions";
import { readStoredFile } from "@/lib/admissions/file-security";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const session = await getApplicantSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: docId } = await params;
  // Search across every application this applicant has ever filed, not just
  // their current one, so documents on a past (already-decided) application
  // stay viewable from its entry in the portal's application history.
  const apps = await getApplicantApplications(session.applicantId);
  const match = apps
    .map((candidate) => ({ app: candidate, doc: candidate.documents.find((d) => d.id === docId) }))
    .find((entry) => entry.doc);

  if (!match?.doc) {
    // IDOR protection: Document does not exist or does not belong to this applicant
    return new NextResponse("Document not found", { status: 404 });
  }
  const { app, doc } = match;

  const buffer = await readStoredFile(doc.filePath, app.id);
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
