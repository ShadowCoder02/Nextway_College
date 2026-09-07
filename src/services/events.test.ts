import { describe, expect, it } from "vitest";
import {
  getEvents,
  getEventBySlug,
  getEventById,
  getAllEventsAdmin,
  getUpcomingEvents,
  getPastEvents,
} from "./events";

describe("getEvents / getEventBySlug / getEventById / getAllEventsAdmin", () => {
  it("getEvents only returns published events, earliest first", async () => {
    const events = await getEvents();
    expect(events.every((e) => e.status === "published")).toBe(true);
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].startAt).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i - 1].startAt).getTime(),
      );
    }
  });

  it("getEventBySlug returns undefined for a nonexistent slug rather than throwing", async () => {
    expect(await getEventBySlug("nonexistent-slug")).toBeUndefined();
  });

  it("getEventById returns undefined for a nonexistent id rather than throwing", async () => {
    expect(await getEventById("nonexistent-id")).toBeUndefined();
  });

  it("getAllEventsAdmin includes unpublished events too", async () => {
    const admin = await getAllEventsAdmin();
    const published = await getEvents();
    expect(admin.length).toBeGreaterThanOrEqual(published.length);
  });
});

// Suite 8 — "A past-dated event does not appear under Upcoming on either
// the homepage or /events. These two surfaces previously disagreed." Both
// surfaces call these same two shared functions (see the comment in
// src/services/events.ts), so testing them once against the real current
// catalog covers both call sites — there's nothing left for the two to
// disagree about. No mocking: this exercises the actual stored event data,
// same as the programmes.test.ts school-filter regression guard.
describe("getUpcomingEvents / getPastEvents", () => {
  it("upcoming and past are disjoint and together cover every published event", async () => {
    const [all, upcoming, past] = await Promise.all([getEvents(), getUpcomingEvents(), getPastEvents()]);
    const upcomingIds = new Set(upcoming.map((e) => e.id));
    const pastIds = new Set(past.map((e) => e.id));

    for (const id of upcomingIds) expect(pastIds.has(id)).toBe(false);
    expect(upcoming.length + past.length).toBe(all.length);
  });

  it("every event in Upcoming genuinely starts at or after now", async () => {
    const upcoming = await getUpcomingEvents();
    const now = Date.now();
    for (const e of upcoming) {
      expect(new Date(e.startAt).getTime()).toBeGreaterThanOrEqual(now);
    }
  });

  it("every event in Past genuinely started before now, most-recent first", async () => {
    const past = await getPastEvents();
    const now = Date.now();
    for (const e of past) {
      expect(new Date(e.startAt).getTime()).toBeLessThan(now);
    }
    for (let i = 1; i < past.length; i++) {
      expect(new Date(past[i - 1].startAt).getTime()).toBeGreaterThanOrEqual(
        new Date(past[i].startAt).getTime(),
      );
    }
  });

  it("respects the limit argument", async () => {
    const upcoming = await getUpcomingEvents(1);
    expect(upcoming.length).toBeLessThanOrEqual(1);
  });
});
