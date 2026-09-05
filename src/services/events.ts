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

// Shared upcoming/past split so the homepage and /events never disagree
// again — both must call these instead of filtering getEvents() themselves.
//
// This compares full instants (event.startAt vs Date.now()), which is
// timezone-invariant: startAt carries its own +05:30 offset, so the
// comparison is correct no matter what timezone the server process runs in.
// Do NOT rewrite this to compare calendar dates (e.g. truncating "today" from
// the server's UTC clock) — Colombo is UTC+5:30, so a UTC day boundary falls
// mid-afternoon in Sri Lanka and would misclassify events for part of every day.

export async function getUpcomingEvents(limit?: number): Promise<EventItem[]> {
  const now = Date.now();
  const upcoming = (await getEvents()).filter((e) => new Date(e.startAt).getTime() >= now);
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export async function getPastEvents(limit?: number): Promise<EventItem[]> {
  const now = Date.now();
  const past = (await getEvents())
    .filter((e) => new Date(e.startAt).getTime() < now)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  return typeof limit === "number" ? past.slice(0, limit) : past;
}
