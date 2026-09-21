import { describe, expect, it } from "vitest";
import { emailParam, otpParam, slugParam, tokenParam } from "./url-params";

describe("apply-page query param validation", () => {
  it("accepts well-formed values and takes the first of a repeated param", () => {
    expect(slugParam("bsc-information-technology")).toBe("bsc-information-technology");
    expect(otpParam("123456")).toBe("123456");
    expect(emailParam("a@b.co")).toBe("a@b.co");
    expect(tokenParam("abcDEF_-0123456789xyz")).toBe("abcDEF_-0123456789xyz");
    expect(slugParam(["law", "x"])).toBe("law");
  });
  it("drops markup, injection strings and malformed values", () => {
    expect(slugParam("<script>alert(1)</script>")).toBeUndefined();
    expect(slugParam("Robert'); DROP TABLE--")).toBeUndefined();
    expect(otpParam("12345")).toBeUndefined();
    expect(otpParam("12345a")).toBeUndefined();
    expect(emailParam("not an email")).toBeUndefined();
    expect(emailParam('"><img src=x onerror=1>@a.co')).toBeUndefined();
    expect(tokenParam("short")).toBeUndefined();
    expect(tokenParam("x".repeat(300))).toBeUndefined();
  });
});
