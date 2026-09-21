import { describe, expect, it } from "vitest";
import { eventNotifySchema } from "./event-validation";

describe("eventNotifySchema", () => {
  it("requires a valid email and consent; name is optional and whitespace-only becomes empty", () => {
    expect(eventNotifySchema.safeParse({ email: "a@b.co", consent: true }).success).toBe(true);
    expect(eventNotifySchema.safeParse({ email: "nope", consent: true }).success).toBe(false);
    expect(eventNotifySchema.safeParse({ email: "a@b.co", consent: false }).success).toBe(false);
    const r = eventNotifySchema.safeParse({ email: "a@b.co", name: "   ", consent: true });
    expect(r.success && r.data.name).toBeUndefined();
    expect(eventNotifySchema.safeParse({ email: "a@b.co", name: "x".repeat(101), consent: true }).success).toBe(false);
  });
});
