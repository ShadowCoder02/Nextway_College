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
  institution: string;
  qualificationType: string; // e.g. "GCE O/L", "GCE A/L", "Diploma", "Bachelors"
  yearCompleted: string;
  indexOrRegNumber?: string;
  subjectsAndGrades: { subject: string; grade: string }[];
  remarks?: string;
}

export interface PersonalInformation {
  title?: string;
  fullName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  nicOrPassport: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
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
  programmeChoice: ProgrammeChoice;
  documents: UploadedDocument[];
  timeline: ApplicationTimelineEvent[];
  notes: ApplicationNote[];
  interview?: InterviewDetails;
  requestedDocumentsNotes?: string;
  declarationConfirmed: boolean;
  declarationTimestamp?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantSession {
  applicantId: string;
  email: string;
  fullName: string;
}
