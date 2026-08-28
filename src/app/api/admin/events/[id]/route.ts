import { NextResponse } from "next/server";
import type { EventItem } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredEvents, saveEvents } from "@/lib/cms/store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as EventItem;
  const events = await getStoredEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  events[idx] = { ...events[idx], ...body, id };
  await saveEvents(events);
  return NextResponse.json({ ok: true, event: events[idx] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const events = await getStoredEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveEvents(filtered);
  return NextResponse.json({ ok: true });
}
