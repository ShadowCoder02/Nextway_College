import { NextResponse } from "next/server";
import type { Programme } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredProgrammes, saveProgrammes } from "@/lib/cms/store";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const programmes = await getStoredProgrammes();
  return NextResponse.json({ programmes });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Programme;
  const programmes = await getStoredProgrammes();
  const newProgramme: Programme = {
    ...body,
    id: body.id || `prog-${crypto.randomUUID().slice(0, 8)}`,
    status: body.status || "published",
    modules: body.modules || [],
    learningOutcomes: body.learningOutcomes || [],
    entryRequirements: body.entryRequirements || [],
    careerOpportunities: body.careerOpportunities || [],
    faqs: body.faqs || [],
  };
  programmes.push(newProgramme);
  await saveProgrammes(programmes);
  return NextResponse.json({ ok: true, programme: newProgramme });
}
