import { z } from "zod";

/**
 * Staff/admin portal login only — deliberately its own file, not part of
 * src/lib/validation.ts. That file's top-level `phoneSchema` pulls in
 * libphonenumber-js (~176KB of client JS); this schema has no phone field
 * at all, and sharing a module with phoneSchema meant /portal/login's
 * client bundle paid for phone-parsing code it never uses.
 */
export const loginSchema = z.object({
  username: z.string().min(2, "Please enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
