import { z } from "zod";
import { normalizeSriLankanPhone } from "@/lib/phone";

/**
 * Sri Lanka-only phone field, backed by libphonenumber-js (see
 * src/lib/phone.ts) — never a digit-count regex. Output is the normalized
 * E.164 string (e.g. "+94771234567"), not whatever format the user typed.
 *
 * Kept out of validation.ts deliberately: only schemas that actually have a
 * phone field (enquirySchema, applicantRegisterSchema, personalInfoSchema)
 * import this, so pages using validation.ts's other schemas (login,
 * forgot/reset-password) don't pull libphonenumber-js's ~176KB into their
 * client bundle for a field they don't have.
 */
export const phoneSchema = z.string().transform((val, ctx) => {
  const result = normalizeSriLankanPhone(val);
  if (!result.valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
    return z.NEVER;
  }
  return result.e164;
});
