import { describe, expect, it } from "vitest";
import { generateOtpCode, isOtpCodeValid } from "./otp";

describe("generateOtpCode", () => {
  it("creates a six-digit numeric code", () => {
    const code = generateOtpCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe("isOtpCodeValid", () => {
  it("compares a generated code against a supplied value", () => {
    const code = "123456";
    expect(isOtpCodeValid(code, code)).toBe(true);
    expect(isOtpCodeValid(code, "654321")).toBe(false);
  });
});
