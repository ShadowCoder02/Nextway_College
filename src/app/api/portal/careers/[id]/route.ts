import { NextResponse } from "next/server";
import type { CareerVacancy } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredCareers, saveCareers } from "@/lib/cms/store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as CareerVacancy;
  const careers = await getStoredCareers();
  const idx = careers.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  careers[idx] = { ...careers[idx], ...body, id };
  await saveCareers(careers);
  return NextResponse.json({ ok: true, career: careers[idx] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const careers = await getStoredCareers();
  const filtered = careers.filter((c) => c.id !== id);
  if (filtered.length === careers.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveCareers(filtered);
  return NextResponse.json({ ok: true });
}
