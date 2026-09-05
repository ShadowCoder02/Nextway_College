import { z } from "zod";
import { normalizeSriLankanPhone } from "@/lib/phone";
import { isCommonPassword } from "@/lib/common-passwords";

/**
 * Sri Lanka-only phone field, backed by libphonenumber-js (see
 * src/lib/phone.ts) — never a digit-count regex. Output is the normalized
 * E.164 string (e.g. "+94771234567"), not whatever format the user typed.
 */
export const phoneSchema = z.string().transform((val, ctx) => {
  const result = normalizeSriLankanPhone(val);
  if (!result.valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
    return z.NEVER;
  }
  return result.e164;
});

/** Trims before length-checking so whitespace-only input can't pass. */
const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(100, "Name must be under 100 characters");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long");

export const enquirySchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  programmeId: z.string().optional(),
  programmeTitle: z.string().optional(),
  qualification: z.string().trim().max(200).optional(),
  intake: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000, "Message must be under 1000 characters").optional(),
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

/* -------------------------------------------------------------------------- */
/*                        Admissions Portal Schemas                           */
/* -------------------------------------------------------------------------- */

/**
 * Shared password policy. Deliberately does NOT trim (leading/trailing
 * spaces are legal password characters) and caps at 128 chars purely as a
 * sanity DoS bound — scrypt has no fixed-length truncation issue the way
 * bcrypt's 72-byte cap does, so this isn't a security-driven limit.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be under 128 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .refine((val) => !isCommonPassword(val), {
    message: "That password is too common — please choose a less predictable one",
  });

export const applicantRegisterSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the admission terms and privacy policy" }),
  }),
});

export type ApplicantRegisterInput = z.infer<typeof applicantRegisterSchema>;

export const applicantLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Missing reset token"),
  password: passwordSchema,
});

export type ApplicantLoginInput = z.infer<typeof applicantLoginSchema>;

export const personalInfoSchema = z.object({
  title: z.string().optional(),
  fullName: nameSchema,
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(4, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select your gender" }),
  }),
  nationality: z.string().trim().min(2, "Nationality is required"),
  nicOrPassport: z.string().trim().min(4, "NIC or Passport number is required"),
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(8, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
});

export const academicQualificationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, "Institution name is required"),
  qualificationType: z.string().min(2, "Qualification type is required"),
  yearCompleted: z.string().min(4, "Year of completion is required"),
  indexOrRegNumber: z.string().optional(),
  subjectsAndGrades: z.array(
    z.object({
      subject: z.string().min(1, "Subject is required"),
      grade: z.string().min(1, "Grade is required"),
    }),
  ),
  remarks: z.string().optional(),
});

export const programmeChoiceSchema = z.object({
  programmeId: z.string().min(1, "Please select a programme"),
  programmeTitle: z.string().min(1, "Programme title is required"),
  programmeSlug: z.string().min(1, "Programme slug is required"),
  level: z.enum(["Degree", "Higher Diploma", "Diploma", "Certificate", "Training"]),
  intake: z.string().min(1, "Please select an intake"),
  studyMode: z.enum(["Hybrid", "Online", "Direct", "Flexible", "Full-time", "Part-time"]),
  campus: z.string().min(1, "Please select a campus/branch"),
});

const draftPersonalInfoSchema = z.object({
  title: z.string().optional(),
  fullName: z.string().optional(),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  nationality: z.string().optional(),
  nicOrPassport: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

const draftAcademicQualificationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().optional(),
  qualificationType: z.string().optional(),
  yearCompleted: z.string().optional(),
  indexOrRegNumber: z.string().optional(),
  subjectsAndGrades: z
    .array(
      z.object({
        subject: z.string().optional(),
        grade: z.string().optional(),
      }),
    )
    .optional(),
  remarks: z.string().optional(),
});

const draftProgrammeChoiceSchema = z.object({
  programmeId: z.string().optional(),
  programmeTitle: z.string().optional(),
  programmeSlug: z.string().optional(),
  level: z.enum(["Degree", "Higher Diploma", "Diploma", "Certificate", "Training"]).optional(),
  intake: z.string().optional(),
  studyMode: z.enum(["Hybrid", "Online", "Direct", "Flexible", "Full-time", "Part-time"]).optional(),
  campus: z.string().optional(),
});

export const saveApplicationDraftSchema = z.object({
  currentStep: z.number().int().min(1).max(5).optional(),
  personalInfo: draftPersonalInfoSchema.optional(),
  qualifications: z.array(draftAcademicQualificationItemSchema).optional(),
  programmeChoice: draftProgrammeChoiceSchema.optional(),
});

export const submitApplicationSchema = z.object({
  personalInfo: personalInfoSchema,
  qualifications: z.array(academicQualificationItemSchema).min(1, "At least one qualification is required"),
  programmeChoice: programmeChoiceSchema,
  declarationConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the declaration to submit your application" }),
  }),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "DOCUMENTS_REQUIRED",
    "DOCUMENTS_VERIFICATION",
    "INTERVIEW_REQUIRED",
    "INTERVIEW_SCHEDULED",
    "APPROVED",
    "REJECTED",
    "WAITLISTED",
    "WITHDRAWN",
    "ENROLLED",
  ]),
  notes: z.string().optional(),
});

export const addAdminNoteSchema = z.object({
  note: z.string().min(2, "Note cannot be empty"),
  isInternal: z.boolean().default(true),
});

export const scheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(4, "Date and time are required"),
  venueOrLink: z.string().min(3, "Venue or online meeting link is required"),
  interviewerName: z.string().optional(),
  instructions: z.string().optional(),
});

export const requestDocumentsSchema = z.object({
  notes: z.string().min(3, "Please specify which documents are required"),
});

export const verifyDocumentSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"]),
  rejectionReason: z.string().optional(),
});
