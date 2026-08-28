import { NextResponse } from "next/server";
import type { EventItem } from "@/types";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoredEvents, saveEvents } from "@/lib/cms/store";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await getStoredEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as EventItem;
  const events = await getStoredEvents();
  const newEvent: EventItem = {
    ...body,
    id: body.id || `evt-${crypto.randomUUID().slice(0, 8)}`,
    status: body.status || "published",
  };
  events.push(newEvent);
  await saveEvents(events);
  return NextResponse.json({ ok: true, event: newEvent });
}
