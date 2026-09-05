import { describe, expect, it } from "vitest";
import { normalizeSriLankanPhone } from "./phone";

describe("normalizeSriLankanPhone", () => {
  const acceptCases: [string, string][] = [
    ["0771234567", "+94771234567"],
    ["077 123 4567", "+94771234567"],
    ["077-123-4567", "+94771234567"],
    ["+94771234567", "+94771234567"],
    ["+94 77 123 4567", "+94771234567"],
    ["0094771234567", "+94771234567"],
    ["94771234567", "+94771234567"],
    ["  0771234567  ", "+94771234567"],
  ];

  it.each(acceptCases)("accepts %s -> %s", (input, expected) => {
    const result = normalizeSriLankanPhone(input);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.e164).toBe(expected);
  });

  it("accepts the college's own Kandy landline (9 digits after the leading zero)", () => {
    // Regression guard: a "must be 10 digits" rule breaks this number.
    const result = normalizeSriLankanPhone("0812201650");
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.e164).toBe("+94812201650");
  });

  const rejectCases = ["077123456", "07712345678901", "abcdefghij", "", "   "];

  it.each(rejectCases)("rejects %j", (input) => {
    expect(normalizeSriLankanPhone(input).valid).toBe(false);
  });

  it("rejects fullwidth digits even though libphonenumber-js would otherwise normalise them", () => {
    expect(normalizeSriLankanPhone("０７７１２３４５６７").valid).toBe(false);
  });

  it("rejects a valid international number under the Sri-Lanka-only policy", () => {
    const result = normalizeSriLankanPhone("+971501234567");
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/outside sri lanka/i);
  });
});
