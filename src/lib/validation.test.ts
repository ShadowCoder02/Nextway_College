import { describe, expect, it } from "vitest";
import { enquirySchema, applicantRegisterSchema, passwordSchema } from "./validation";

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
