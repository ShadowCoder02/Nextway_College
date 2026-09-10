import type { ProgrammeLevel, StudyMode } from "./index";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "DOCUMENTS_VERIFICATION"
  | "INTERVIEW_REQUIRED"
  | "INTERVIEW_SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED"
  | "WITHDRAWN"
  | "ENROLLED";

export type DocumentCategory =
  | "nic_passport"
  | "academic_ol"
  | "academic_al"
  | "higher_education"
  | "birth_certificate"
  | "photograph"
  | "other";

export type DocumentVerificationStatus = "pending" | "verified" | "rejected";

export interface AcademicQualification {
  id: string;
  // Optional: the paper form's 07 (O/L) and 08 (A/L) sections have no
  // institution field at all, only Year + Index No + the subjects table.
  institution?: string;
  qualificationType: string; // "GCE O/L" | "GCE A/L"
  // Optional: item 08 (A/L) is legitimately left blank by applicants who
  // haven't sat A/Ls.
  yearCompleted?: string;
  indexOrRegNumber?: string;
  subjectsAndGrades: { subject: string; grade: string }[];
  remarks?: string;
}

// Form item 09 — "Professional Qualifications" table: Institution,
// Qualifications Obtained, Date of Commencement, Effective Date, Duration.
// Kept separate from AcademicQualification (O/L, A/L) since the paper
// form's columns don't map onto the O/L/A/L subjects-and-grades shape.
export interface ProfessionalQualification {
  id: string;
  institution: string;
  qualificationObtained: string;
  dateOfCommencement?: string;
  effectiveDate?: string;
  duration?: string;
}

// Form item 10(a) — "Present Occupation" table, marked on the paper form as
// applicable only if the applicant currently holds/held a job.
export interface PresentOccupationEntry {
  id: string;
  occupation: string;
  institute: string;
  from?: string;
  to?: string;
  numberOfMonths?: string;
  lastSalaryDrawn?: string;
}

export interface PersonalInformation {
  title?: string;
  fullName: string; // 01(a) Name in Full
  nameWithInitials: string; // 01(b) Name with initials
  dateOfBirth: string; // 04(a) Date of Birth
  civilStatus: string; // 05. Civil Status
  nicOrPassport: string; // 03. National Identity Card No.
  email: string; // not a numbered field — carried over from the applicant's account
  phone: string; // 02(c) Mobile
  homeTelephone?: string; // 02(c) Home
  addressLine1: string; // 02(a) Permanent Address
  city: string;
  postalCode?: string;
  country: string;
  contactAddress?: string; // 02(b) Contact Address (if different from permanent address)
}

export interface ProgrammeChoice {
  programmeId: string;
  programmeTitle: string;
  programmeSlug: string;
  level: ProgrammeLevel;
  intake: string;
  studyMode: StudyMode;
  campus: string;
}

export interface UploadedDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedAt: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  timestamp: string;
  actor: string; // e.g. "Applicant", "Admissions Officer", "System"
  action: string;
  details?: string;
}

export interface ApplicationNote {
  id: string;
  authorName: string;
  note: string;
  isInternal: boolean;
  createdAt: string;
}

export interface InterviewDetails {
  scheduledAt: string;
  venueOrLink: string;
  interviewerName?: string;
  instructions?: string;
}

export interface StudentApplication {
  id: string;
  applicationNumber: string; // e.g. APP-2026-000125
  applicantId: string;
  status: ApplicationStatus;
  currentStep: number;
  personalInfo: PersonalInformation;
  qualifications: AcademicQualification[];
  professionalQualifications: ProfessionalQualification[];
  presentOccupation: PresentOccupationEntry[];
  programmeChoice: ProgrammeChoice;
  documents: UploadedDocument[];
  timeline: ApplicationTimelineEvent[];
  notes: ApplicationNote[];
  interview?: InterviewDetails;
  requestedDocumentsNotes?: string;
  declarationConfirmed: boolean;
  declarationTimestamp?: string;
  signatureName?: string; // typed e-signature captured alongside the declaration
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  isVerified: boolean;
  verificationToken?: string;
  tokenExpiresAt?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  // Bumped on password reset so every previously-issued session cookie
  // (which embeds the version it was signed with) stops verifying.
  sessionVersion: number;
  resetTokenHash?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantSession {
  applicantId: string;
  email: string;
  fullName: string;
  sessionVersion: number;
}
