import { NextResponse } from "next/server";
import type { CareerVacancy } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredCareers, saveCareers } from "@/lib/cms/store";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const careers = await getStoredCareers();
  return NextResponse.json({ careers });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as CareerVacancy;
  const careers = await getStoredCareers();
  const slug =
    body.slug ||
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const vacancy: CareerVacancy = {
    ...body,
    id: body.id || `career-${crypto.randomUUID().slice(0, 8)}`,
    slug,
    requirements: body.requirements || [],
    status: body.status || "published",
    postedAt: body.postedAt || new Date().toISOString().slice(0, 10),
  };
  careers.unshift(vacancy);
  await saveCareers(careers);
  return NextResponse.json({ ok: true, career: vacancy });
}
