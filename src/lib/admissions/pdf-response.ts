import { NextResponse } from "next/server";
import type { StudentApplication } from "@/types/admissions";
import { generateApplicationPdf } from "@/lib/admissions/pdf";

/** Shared by the applicant-facing and admin-facing PDF download routes —
 * same response shape either way, so a future change (cache headers,
 * filename sanitization, etc.) only needs to happen once. */
export async function buildApplicationPdfResponse(app: StudentApplication): Promise<NextResponse> {
  const pdfBuffer = await generateApplicationPdf(app);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${app.applicationNumber}.pdf"`,
    },
  });
}
