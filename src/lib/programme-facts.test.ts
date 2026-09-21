import { describe, expect, it } from "vitest";
import { programmesSeed } from "@/data/programmes-seed";
import { FACT_KEYS, getProgrammeFacts } from "./programme-facts";
import { needsInput } from "./client-input";

describe("getProgrammeFacts", () => {
  it("always returns every required fact, for every seeded programme", () => {
    for (const p of programmesSeed) {
      const facts = getProgrammeFacts(p);
      expect(Object.keys(facts).sort()).toEqual([...FACT_KEYS].sort());
    }
  });
  it("marks unsupplied facts pending instead of guessing, and never leaks tokens", () => {
    const p = { ...programmesSeed[0], awardingInstitution: needsInput("x"), recognition: undefined };
    const facts = getProgrammeFacts(p);
    expect(facts.awardingInstitution).toMatchObject({ value: null, state: "pending" });
    expect(facts.recognition).toMatchObject({ value: null, state: "pending" });
    expect(JSON.stringify(facts)).not.toContain("NEEDS CLIENT INPUT");
  });
  it("treats the generic seed duration as not-yet-confirmed and fees as on-request", () => {
    const p = { ...programmesSeed[0], duration: "As per programme structure", fees: undefined };
    const facts = getProgrammeFacts(p);
    expect(facts.duration.state).toBe("pending");
    expect(facts.fees.state).toBe("on-request");
  });
  it("shows real values when supplied", () => {
    const p = { ...programmesSeed[0], awardingInstitution: "Example University", duration: "3 years" };
    const facts = getProgrammeFacts(p);
    expect(facts.awardingInstitution).toMatchObject({ value: "Example University", state: "provided" });
    expect(facts.duration.value).toBe("3 years");
  });
});
