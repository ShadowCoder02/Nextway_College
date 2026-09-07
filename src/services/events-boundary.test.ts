import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventItem } from "@/types";

// Deliberately no static top-level `import ... from "./events"` in this
// file (unlike events.test.ts) — mixing that with vi.doMock + a dynamic
// import in the same file caused the mock to leak into the statically-
// imported instance's module graph. Isolating the mocked boundary case
// here keeps it deterministic without real-data flakiness around "is there
// currently a past and an upcoming event stored right now."
function makeEvent(overrides: Partial<EventItem>): EventItem {
  return {
    id: "evt-boundary",
    title: "Test Event",
    slug: "test-event",
    summary: "Summary",
    description: "Description",
    startAt: "2026-09-12T09:00:00+05:30",
    location: "Kandy Campus",
    imageUrl: "/images/hero-image.jpg",
    status: "published",
    ...overrides,
  };
}

afterEach(() => {
  vi.doUnmock("@/lib/cms/store");
  vi.resetModules();
});

describe("getUpcomingEvents / getPastEvents — exact boundary", () => {
  it("an event starting exactly now counts as upcoming, not past (inclusive boundary)", async () => {
    const now = new Date("2026-09-06T12:00:00+05:30");
    vi.setSystemTime(now);

    const rightNow = makeEvent({ id: "now-1", startAt: now.toISOString() });
    vi.doMock("@/lib/cms/store", () => ({ getStoredEvents: async () => [rightNow] }));

    const { getUpcomingEvents, getPastEvents } = await import("./events");
    expect((await getUpcomingEvents()).map((e) => e.id)).toContain("now-1");
    expect((await getPastEvents()).map((e) => e.id)).not.toContain("now-1");

    vi.useRealTimers();
  });

  it("a past-dated event never appears under Upcoming even when it's the only event stored", async () => {
    const now = new Date("2026-09-06T12:00:00+05:30");
    vi.setSystemTime(now);

    const past = makeEvent({ id: "past-1", startAt: "2026-08-01T09:00:00+05:30" });
    vi.doMock("@/lib/cms/store", () => ({ getStoredEvents: async () => [past] }));

    const { getUpcomingEvents, getPastEvents } = await import("./events");
    expect((await getUpcomingEvents()).map((e) => e.id)).not.toContain("past-1");
    expect((await getPastEvents()).map((e) => e.id)).toContain("past-1");

    vi.useRealTimers();
  });
});
