import { describe, expect, it } from "vitest";
import { enquirySchema, applicantRegisterSchema } from "./validation";
// Tested against the module login/forgot-password/reset-password actually
// import in production, not validation.ts's re-export of it.
import { passwordSchema } from "./account-validation";

const validEnquiry = {
  fullName: "Nimal Perera",
  phone: "0771234567",
  email: "nimal@example.com",
  consent: true as const,
};

describe("enquirySchema", () => {
  it("accepts a well-formed enquiry", () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it("rejects a whitespace-only name (a bare .min() check would let this through)", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, fullName: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts Tamil and Sinhala names — the college advertises Tamil-medium delivery", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "நித்தர்சன்" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "සමන් පෙරේරා" }).success).toBe(true);
  });

  it("accepts apostrophes, hyphens and periods in names", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "O'Brien" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "Jean-Pierre" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "A. Fernando" }).success).toBe(true);
  });

  it("normalises the college's own Kandy landline to E.164", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, phone: "0812201650" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+94812201650");
  });

  it("lowercases and trims email on parse", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, email: "  NIMAL@EXAMPLE.COM  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("nimal@example.com");
  });

  it("rejects an email over 254 characters", () => {
    const longEmail = `${"a".repeat(250)}@example.com`;
    expect(enquirySchema.safeParse({ ...validEnquiry, email: longEmail }).success).toBe(false);
  });

  it("rejects a message over 1000 characters", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, message: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, consent: false }).success).toBe(false);
  });
});

// Suite 2 — Email (regression suite, docs/fix-prompts.md "GitHub Copilot —
// Prompt 1"). The account-enumeration guard (registerApplicant returning
// the identical response shape for a new vs. already-registered email) is
// an integration-level behavior, not a pure schema check — see
// e2e/security.spec.ts for that assertion.
describe("email validation (enquirySchema)", () => {
  const acceptEmails = ["user@example.com", "user+tag@gmail.com", "user.name@sub.domain.lk"];
  it.each(acceptEmails)("accepts %s", (email) => {
    expect(enquirySchema.safeParse({ ...validEnquiry, email }).success).toBe(true);
  });

  it("accepts and lowercases a whitespace-padded, uppercase email", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, email: "  USER@EXAMPLE.COM  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("user@example.com");
  });

  const rejectEmails = ["user@example", "user @example.com", "user@@example.com"];
  it.each(rejectEmails)("rejects %j", (email) => {
    expect(enquirySchema.safeParse({ ...validEnquiry, email }).success).toBe(false);
  });

  it("rejects a 320-character email", () => {
    const longLocal = "a".repeat(308);
    const email = `${longLocal}@example.com`; // 320 chars total
    expect(email.length).toBe(320);
    expect(enquirySchema.safeParse({ ...validEnquiry, email }).success).toBe(false);
  });
});

// Suite 3 — Name field
describe("name field validation (enquirySchema.fullName)", () => {
  it("rejects a 1-character name", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "A" }).success).toBe(false);
  });

  it("rejects a 500-character name", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "A".repeat(500) }).success).toBe(false);
  });

  // it.fails: documents a real, currently-failing regression-suite case
  // without silently adjusting the assertion or hiding it from the run —
  // vitest reports this as a distinct, visible "expected fail" result, and
  // will itself start failing the moment nameSchema starts rejecting
  // emoji, so it can't go stale silently either. Reported, not fixed.
  it.fails("GAP: rejects emoji-only input", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, fullName: "😀😀" }).success).toBe(false);
  });

  it("accepts a script-tag payload as a valid string (React's default JSX escaping — not the schema — is what prevents execution; see e2e/security.spec.ts for the rendered-DOM assertion)", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, fullName: "<script>alert(1)</script>" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.fullName).toBe("<script>alert(1)</script>");
  });
});

// Suite 4 — Password
describe("password validation (regression suite additions)", () => {
  it("does not trim leading/trailing spaces", () => {
    const result = passwordSchema.safeParse("  Str0ngPassw0rd  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("  Str0ngPassw0rd  ");
  });

  it.fails("GAP: rejects a password containing the user's email", () => {
    // applicantRegisterSchema has no cross-field refine comparing password
    // against email — passwordSchema alone can't see the email field, and
    // no object-level check exists either. Reported, not fixed here.
    const result = applicantRegisterSchema.safeParse({
      fullName: "Sarah Perera",
      email: "sarah@example.com",
      phone: "0771234567",
      password: "sarah@example.com123",
      agreeTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it.fails("SPEC MISMATCH: accepts a 200-char password (spec's literal number; real cap is 128)", () => {
    // src/lib/account-validation.ts's passwordSchema: max(128, "Password
    // must be under 128 characters"), a deliberate DoS-sanity bound, not a
    // truncation bug — passwords over the cap are cleanly REJECTED, never
    // silently truncated (see the passing companion test below for that
    // property at the REAL boundary). The spec's "200" was written without
    // sight of this constant.
    const password200 = `Aa1${"x".repeat(197)}`;
    expect(password200.length).toBe(200);
    const result = passwordSchema.safeParse(password200);
    expect(result.success).toBe(true);
  });

  it("accepts a password at the real 128-char cap, rejects 129 outright (no silent truncation)", () => {
    const at128 = `Aa1${"x".repeat(125)}`;
    expect(at128.length).toBe(128);
    expect(passwordSchema.safeParse(at128).success).toBe(true);

    const at129 = `Aa1${"x".repeat(126)}`;
    expect(at129.length).toBe(129);
    expect(passwordSchema.safeParse(at129).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a strong password and does not trim it", () => {
    const result = passwordSchema.safeParse("  Str0ngPassw0rd  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("  Str0ngPassw0rd  ");
  });

  it("rejects short passwords, passwords without a letter or digit, and common ones", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("aaaaaaaa").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
    expect(passwordSchema.safeParse("password").success).toBe(false);
  });

  it("rejects passwords over 128 characters", () => {
    expect(passwordSchema.safeParse(`Aa1${"x".repeat(126)}`).success).toBe(false);
  });
});

describe("applicantRegisterSchema", () => {
  it("accepts a well-formed registration", () => {
    const result = applicantRegisterSchema.safeParse({
      fullName: "Sarah Perera",
      email: "sarah@example.com",
      phone: "0771234567",
      password: "Str0ngPassword",
      agreeTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-Sri-Lankan phone number", () => {
    const result = applicantRegisterSchema.safeParse({
      fullName: "Sarah Perera",
      email: "sarah@example.com",
      phone: "+14155552671",
      password: "Str0ngPassword",
      agreeTerms: true,
    });
    expect(result.success).toBe(false);
  });
});
