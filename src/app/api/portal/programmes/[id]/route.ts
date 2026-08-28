import { NextResponse } from "next/server";
import type { Programme } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredProgrammes, saveProgrammes } from "@/lib/cms/store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Programme;
  const programmes = await getStoredProgrammes();
  const idx = programmes.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  programmes[idx] = { ...programmes[idx], ...body, id };
  await saveProgrammes(programmes);
  return NextResponse.json({ ok: true, programme: programmes[idx] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const programmes = await getStoredProgrammes();
  const filtered = programmes.filter((p) => p.id !== id);
  if (filtered.length === programmes.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveProgrammes(filtered);
  return NextResponse.json({ ok: true });
}
