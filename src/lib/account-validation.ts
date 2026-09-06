import { z } from "zod";
import { isCommonPassword } from "@/lib/common-passwords";

// Deliberately duplicated (not imported) from validation.ts's private
// emailSchema: this file's whole point is staying out of validation.ts's
// module graph, which imports phone-schema.ts / libphonenumber-js. Login,
// forgot-password and reset-password have no phone field and shouldn't pay
// for phone-parsing code in their client bundle.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long");

/** Shared password policy. Deliberately does NOT trim (leading/trailing
 * spaces are legal password characters) and caps at 128 chars purely as a
 * sanity DoS bound — scrypt has no fixed-length truncation issue the way
 * bcrypt's 72-byte cap does, so this isn't a security-driven limit. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be under 128 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .refine((val) => !isCommonPassword(val), {
    message: "That password is too common — please choose a less predictable one",
  });

export const applicantLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password"),
});

export type ApplicantLoginInput = z.infer<typeof applicantLoginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Missing reset token"),
  password: passwordSchema,
});
