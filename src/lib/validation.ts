import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(9, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  programmeId: z.string().optional(),
  programmeTitle: z.string().optional(),
  qualification: z.string().optional(),
  intake: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to be contacted" }),
  }),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

export const loginSchema = z.object({
  username: z.string().min(2, "Please enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
