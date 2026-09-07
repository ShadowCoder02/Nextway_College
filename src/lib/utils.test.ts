import { afterEach, describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./utils";

// Suite 8 — Date and timezone (regression suite, docs/fix-prompts.md
// "GitHub Copilot — Prompt 1"). formatDate/formatDateTime pass an explicit
// `timeZone: "Asia/Colombo"` to Intl.DateTimeFormat, which overrides
// whatever timezone the host process happens to be running under — so
// these must produce identical output regardless of process.env.TZ. We
// mutate process.env.TZ directly (rather than three separate CI matrix
// runs) since Node reads it lazily per Intl call, not just at boot.
const ORIGINAL_TZ = process.env.TZ;

afterEach(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

describe("formatDateTime — timezone invariance", () => {
  const zones = ["UTC", "Asia/Colombo", "America/New_York"];

  it.each(zones)("renders the Kandy Open Day as 9:00 AM under TZ=%s, never 3:30 AM", (tz) => {
    process.env.TZ = tz;
    const result = formatDateTime("2026-09-12T09:00:00+05:30");
    expect(result).toContain("9:00");
    expect(result).toMatch(/\bAM\b/);
    expect(result).not.toContain("3:30");
  });

  it.each(zones)("produces identical output under TZ=%s as under any other zone", (tz) => {
    process.env.TZ = tz;
    const result = formatDateTime("2026-09-12T09:00:00+05:30");
    process.env.TZ = "UTC";
    const utcResult = formatDateTime("2026-09-12T09:00:00+05:30");
    expect(result).toBe(utcResult);
  });
});

describe("formatDate — timezone invariance", () => {
  const zones = ["UTC", "Asia/Colombo", "America/New_York"];

  it.each(zones)("renders the same calendar date under TZ=%s as under UTC", (tz) => {
    // Late-evening Colombo time — the case most likely to roll over to a
    // different UTC calendar date, which is exactly what a timezone-naive
    // formatter would get wrong.
    process.env.TZ = tz;
    const result = formatDate("2026-07-15T23:30:00+05:30");
    process.env.TZ = "UTC";
    const utcResult = formatDate("2026-07-15T23:30:00+05:30");
    expect(result).toBe(utcResult);
    expect(result).toContain("15");
    expect(result).toContain("2026");
    expect(result).toMatch(/july/i);
  });
});
