import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Sri Lanka only, by policy: international applicants (a real segment — the
 * Gulf diaspora) are directed to contact Admissions directly rather than
 * self-registering with a foreign number, so staff can record it manually.
 * Never write a raw digit-count rule here — 0812201650 (the college's own
 * Kandy landline) is 9 digits after the leading zero, not 10.
 */
export const PHONE_HELP_MESSAGE =
  "Please enter a Sri Lankan mobile or landline number (e.g. 077 123 4567 or 081 220 1650). " +
  "Applying from outside Sri Lanka? Contact Admissions directly and our team will assist you.";

export type PhoneValidationResult =
  | { valid: true; e164: string }
  | { valid: false; error: string };

// libphonenumber-js normalizes fullwidth digits (e.g. "０７７...") to their
// ASCII equivalents and happily parses them — reject before it gets a
// chance to, since a fullwidth-digit string is a strong signal of copy-paste
// corruption or an encoding mismatch, not a real phone number a Sri Lankan
// keyboard would produce.
const ASCII_PHONE_CHARS = /^[0-9+\-\s()]*$/;

export function normalizeSriLankanPhone(input: string): PhoneValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a phone number." };
  }

  if (!ASCII_PHONE_CHARS.test(trimmed)) {
    return { valid: false, error: PHONE_HELP_MESSAGE };
  }

  const parsed = parsePhoneNumberFromString(trimmed, "LK");
  if (!parsed || !parsed.isValid()) {
    return { valid: false, error: PHONE_HELP_MESSAGE };
  }

  if (parsed.country !== "LK") {
    return { valid: false, error: PHONE_HELP_MESSAGE };
  }

  return { valid: true, e164: parsed.number };
}
