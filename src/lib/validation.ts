import { z } from "zod";
// Not re-exported: nothing outside this file's own schemas should import
// phoneSchema/passwordSchema via @/lib/validation — doing so would pull
// phone-schema.ts (and libphonenumber-js) into that importer's bundle even
// if it doesn't need a phone field. Import from @/lib/phone-schema or
// @/lib/account-validation directly instead.
import { phoneSchema } from "@/lib/phone-schema";
import { passwordSchema } from "@/lib/account-validation";

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

// Staff/admin login (username + password, no phone field) moved to
// src/lib/staff-login-validation.ts so it doesn't share a module — and
// therefore a client bundle — with this file's phone-parsing dependency.

/* -------------------------------------------------------------------------- */
/*                        Admissions Portal Schemas                           */
/* -------------------------------------------------------------------------- */

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

// applicantLoginSchema, forgotPasswordSchema, resetPasswordSchema moved to
// src/lib/account-validation.ts — none have a phone field, and keeping them
// out of this module's graph keeps their pages' client bundles free of the
// phoneSchema -> libphonenumber-js dependency.

export const personalInfoSchema = z.object({
  title: z.string().optional(),
  fullName: nameSchema,
  nameWithInitials: z.string().trim().min(2, "Name with initials is required").max(150),
  dateOfBirth: z.string().min(4, "Date of birth is required"),
  civilStatus: z.string().trim().min(2, "Civil status is required"),
  nicOrPassport: z.string().trim().min(4, "NIC or Passport number is required"),
  email: emailSchema,
  phone: phoneSchema,
  homeTelephone: z.string().optional(),
  addressLine1: z.string().min(3, "Permanent address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  contactAddress: z.string().optional(),
});

export const academicQualificationItemSchema = z.object({
  id: z.string(),
  institution: z.string().optional(),
  qualificationType: z.string().min(2, "Qualification type is required"),
  // Not required here: the A/L section (item 08) is legitimately left
  // blank by applicants who haven't sat A/Ls. Whether O/L specifically
  // must be filled in is enforced as a business rule in submitApplication,
  // not as a per-item shape constraint shared by both O/L and A/L.
  yearCompleted: z.string().optional(),
  indexOrRegNumber: z.string().optional(),
  subjectsAndGrades: z.array(
    z.object({
      subject: z.string().min(1, "Subject is required"),
      grade: z.string().min(1, "Grade is required"),
    }),
  ),
  remarks: z.string().optional(),
});

export const professionalQualificationItemSchema = z.object({
  id: z.string(),
  institution: z.string().trim().min(1, "Institution is required"),
  qualificationObtained: z.string().trim().min(1, "Qualification obtained is required"),
  dateOfCommencement: z.string().optional(),
  effectiveDate: z.string().optional(),
  duration: z.string().optional(),
});

export const presentOccupationItemSchema = z.object({
  id: z.string(),
  occupation: z.string().trim().min(1, "Occupation is required"),
  institute: z.string().trim().min(1, "Institute is required"),
  from: z.string().optional(),
  to: z.string().optional(),
  numberOfMonths: z.string().optional(),
  lastSalaryDrawn: z.string().optional(),
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
  nameWithInitials: z.string().optional(),
  dateOfBirth: z.string().optional(),
  civilStatus: z.string().optional(),
  nicOrPassport: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  homeTelephone: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  contactAddress: z.string().optional(),
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

const draftProfessionalQualificationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().optional(),
  qualificationObtained: z.string().optional(),
  dateOfCommencement: z.string().optional(),
  effectiveDate: z.string().optional(),
  duration: z.string().optional(),
});

const draftPresentOccupationItemSchema = z.object({
  id: z.string().optional(),
  occupation: z.string().optional(),
  institute: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  numberOfMonths: z.string().optional(),
  lastSalaryDrawn: z.string().optional(),
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
  professionalQualifications: z.array(draftProfessionalQualificationItemSchema).optional(),
  presentOccupation: z.array(draftPresentOccupationItemSchema).optional(),
  programmeChoice: draftProgrammeChoiceSchema.optional(),
});

export const submitApplicationSchema = z.object({
  personalInfo: personalInfoSchema,
  qualifications: z.array(academicQualificationItemSchema).min(1, "At least one qualification is required"),
  // Items 09 and 10(a) are explicitly marked "if applicable" on the paper
  // form — not every applicant has professional qualifications or a
  // present occupation, so these arrays may be empty.
  professionalQualifications: z.array(professionalQualificationItemSchema),
  presentOccupation: z.array(presentOccupationItemSchema),
  programmeChoice: programmeChoiceSchema,
  signatureName: z.string().trim().min(2, "Please type your full name as your signature"),
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
