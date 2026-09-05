import test from "node:test";
import assert from "node:assert/strict";
import { generateOtpCode, isOtpCodeValid } from "./otp";

test("generateOtpCode creates a six-digit numeric code", () => {
  const code = generateOtpCode();
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test("isOtpCodeValid compares a generated code against a supplied value", () => {
  const code = "123456";
  assert.equal(isOtpCodeValid(code, code), true);
  assert.equal(isOtpCodeValid(code, "654321"), false);
});
