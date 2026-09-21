import { z } from "zod";

// Kept out of validation.ts on purpose: that module's graph includes
// phone-schema.ts / libphonenumber-js, and this form has no phone field, so
// importing from there would add ~45kB gz to every page that shows it.
const emailSchema = z
  .string({ required_error: "Please enter your email address" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long");

/** "Notify me about upcoming events" - email is the only required contact. */
export const eventNotifySchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name must be under 100 characters")
    .optional()
    .transform((v) => (v ? v : undefined)),
  email: emailSchema,
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to receive event notifications" }),
  }),
});

export type EventNotifyData = z.infer<typeof eventNotifySchema>;
