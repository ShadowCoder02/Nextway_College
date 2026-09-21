import { describe, expect, it } from "vitest";
import { clientValue, needsClientInput, needsInput } from "./client-input";

describe("client-input placeholders", () => {
  it("recognises tokens and never lets them through as values", () => {
    const token = needsInput("a real photo");
    expect(needsClientInput(token)).toBe(true);
    expect(clientValue(token)).toBeUndefined();
    expect(clientValue("  " + token)).toBeUndefined();
  });
  it("passes real content and rejects empties", () => {
    expect(clientValue("https://example.com/x")).toBe("https://example.com/x");
    expect(clientValue("")).toBeUndefined();
    expect(clientValue("   ")).toBeUndefined();
    expect(clientValue(undefined)).toBeUndefined();
  });
});
