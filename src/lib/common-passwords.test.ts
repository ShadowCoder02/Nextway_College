import { describe, expect, it } from "vitest";
import { isCommonPassword } from "./common-passwords";

describe("isCommonPassword", () => {
  it("flags widely-known breached passwords, case-insensitively", () => {
    expect(isCommonPassword("password")).toBe(true);
    expect(isCommonPassword("Password")).toBe(true);
    expect(isCommonPassword("123456789")).toBe(true);
  });

  it("flags repeated-character strings", () => {
    expect(isCommonPassword("aaaaaaaa")).toBe(true);
    expect(isCommonPassword("11111111")).toBe(true);
  });

  it("flags fully sequential strings", () => {
    expect(isCommonPassword("abcdefgh")).toBe(true);
    expect(isCommonPassword("87654321")).toBe(true);
  });

  it("does not flag a genuinely unpredictable password", () => {
    expect(isCommonPassword("Tr0ub4dor&3xyz")).toBe(false);
  });
});
