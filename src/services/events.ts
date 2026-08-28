import type { EventItem } from "@/types";
import { getStoredEvents } from "@/lib/cms/store";

async function loadEvents(): Promise<EventItem[]> {
  return getStoredEvents();
}

export async function getEvents(): Promise<EventItem[]> {
  return (await loadEvents())
    .filter((e) => e.status === "published")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export async function getAllEventsAdmin(): Promise<EventItem[]> {
  return loadEvents();
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  return (await loadEvents()).find((e) => e.slug === slug && e.status === "published");
}

export async function getEventById(id: string): Promise<EventItem | undefined> {
  return (await loadEvents()).find((e) => e.id === id);
}

export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  const now = Date.now();
  const upcoming = (await getEvents()).filter((e) => new Date(e.startAt).getTime() >= now);
  return upcoming.slice(0, limit);
}
