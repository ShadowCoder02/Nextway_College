import type {
  AcademicQualification,
  ApplicantAccount,
  ApplicantSession,
  ApplicationStatus,
  DocumentCategory,
  DocumentVerificationStatus,
  InterviewDetails,
  PersonalInformation,
  ProgrammeChoice,
  StudentApplication,
  UploadedDocument,
} from "@/types/admissions";
import {
  createStoredApplicant,
  findApplicantByEmail,
  findApplicantById,
  findApplicationById,
  getOrCreateApplicantDraft,
  getStoredApplications,
  saveStoredApplication,
  updateApplicationStatus,
  addApplicationDocument,
  removeApplicationDocument,
  updateDocumentVerification,
  addApplicationNote,
  updateStoredApplicant,
} from "@/lib/cms/admissions-store";
import { hashPassword, verifyPassword } from "@/lib/admissions/crypto";
import {
  saveUploadedFile,
  deleteStoredFile,
  generateSafeStoredFilename,
  verifyFileMagicBytes,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/admissions/file-security";
import path from "path";
import { sendApplicantVerificationEmail, sendApplicationConfirmationEmail } from "@/lib/admissions/mailer";
import { generateOtpCode } from "@/lib/admissions/otp";
import { generateApplicationPdf } from "@/lib/admissions/pdf";

/* -------------------------------------------------------------------------- */
/*                            Applicant Auth Services                         */
/* -------------------------------------------------------------------------- */

export async function registerApplicant(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ ok: true; applicant: ApplicantAccount; requiresVerification: true; debugOtp?: string } | { ok: false; error: string }> {
  const existing = await findApplicantByEmail(data.email);
  if (existing) {
    return { ok: false, error: "An account with this email address already exists." };
  }

  const { hash, salt } = await hashPassword(data.password);
  const otp = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const applicant = await createStoredApplicant({
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    passwordHash: hash,
    passwordSalt: salt,
    isVerified: false,
    verificationCode: otp,
    verificationCodeExpiresAt: otpExpiresAt,
  });

  try {
    await sendApplicantVerificationEmail({
      fullName: applicant.fullName,
      email: applicant.email,
      otp,
    });
  } catch (error) {
    console.warn("[applicant/register] verification email delivery failed; continuing in local mode.", error);
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, applicant, requiresVerification: true, debugOtp: otp };
    }
  }

  return { ok: true, applicant, requiresVerification: true, ...(process.env.NODE_ENV !== "production" ? { debugOtp: otp } : {}) };
}

export async function authenticateApplicant(
  email: string,
  password: string,
): Promise<{ ok: true; applicant: ApplicantAccount; session: ApplicantSession } | { ok: false; error: string }> {
  const applicant = await findApplicantByEmail(email);
  if (!applicant) {
    return { ok: false, error: "Invalid email or password." };
  }

  if (!applicant.isVerified) {
    return { ok: false, error: "Please verify your email address before signing in." };
  }

  const valid = await verifyPassword(password, applicant.passwordHash, applicant.passwordSalt);
  if (!valid) {
    return { ok: false, error: "Invalid email or password." };
  }

  const session: ApplicantSession = {
    applicantId: applicant.id,
    email: applicant.email,
    fullName: applicant.fullName,
  };

  return { ok: true, applicant, session };
}

export async function getApplicantProfile(
  applicantId: string,
): Promise<ApplicantAccount | null> {
  return findApplicantById(applicantId);
}

export async function verifyApplicantOtp(
  email: string,
  otp: string,
): Promise<{ ok: true; applicant: ApplicantAccount; session: ApplicantSession } | { ok: false; error: string }> {
  const applicant = await findApplicantByEmail(email);
  if (!applicant) {
    return { ok: false, error: "Account not found." };
  }

  if (applicant.isVerified) {
    return { ok: true, applicant, session: { applicantId: applicant.id, email: applicant.email, fullName: applicant.fullName } };
  }

  const expiresAt = applicant.verificationCodeExpiresAt ? new Date(applicant.verificationCodeExpiresAt).getTime() : 0;
  if (!applicant.verificationCode || Date.now() > expiresAt) {
    return { ok: false, error: "Your verification code has expired. Please request a new one." };
  }

  if (applicant.verificationCode !== otp.trim()) {
    return { ok: false, error: "The verification code is incorrect." };
  }

  const updated = await updateStoredApplicant(applicant.id, {
    isVerified: true,
    verificationCode: undefined,
    verificationCodeExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return { ok: false, error: "Unable to verify account at this time." };
  }

  const session: ApplicantSession = {
    applicantId: updated.id,
    email: updated.email,
    fullName: updated.fullName,
  };

  return { ok: true, applicant: updated, session };
}

export async function resendVerificationOtp(
  email: string,
): Promise<{ ok: true; message: string; debugOtp?: string } | { ok: false; error: string }> {
  const applicant = await findApplicantByEmail(email);
  if (!applicant) {
    return { ok: false, error: "Account not found." };
  }

  const otp = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await updateStoredApplicant(applicant.id, {
    verificationCode: otp,
    verificationCodeExpiresAt: otpExpiresAt,
    updatedAt: new Date().toISOString(),
  });

  try {
    await sendApplicantVerificationEmail({
      fullName: applicant.fullName,
      email: applicant.email,
      otp,
    });
  } catch (error) {
    console.warn("[applicant/register] resend OTP email delivery failed; continuing in local mode.", error);
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, message: "A new OTP has been generated for local testing.", debugOtp: otp };
    }
  }

  return { ok: true, message: "A new OTP has been sent to your email address.", ...(process.env.NODE_ENV !== "production" ? { debugOtp: otp } : {}) };
}

/* -------------------------------------------------------------------------- */
/*                         Applicant Application Services                      */
/* -------------------------------------------------------------------------- */

export async function getApplicantApplication(
  applicantId: string,
): Promise<StudentApplication | null> {
  const applicant = await findApplicantById(applicantId);
  if (!applicant) return null;

  return getOrCreateApplicantDraft(applicantId, {
    personalInfo: {
      fullName: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      dateOfBirth: "",
      gender: "Male",
      nationality: "Sri Lankan",
      nicOrPassport: "",
      addressLine1: "",
      city: "",
      country: "Sri Lanka",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
    },
  });
}

type DraftQualificationPatch = Omit<Partial<AcademicQualification>, "subjectsAndGrades"> & {
  subjectsAndGrades?: Array<Partial<{ subject: string; grade: string }>>;
};

export async function saveApplicationDraft(
  applicantId: string,
  patch: {
    currentStep?: number;
    personalInfo?: Partial<PersonalInformation>;
    qualifications?: DraftQualificationPatch[];
    programmeChoice?: Partial<ProgrammeChoice>;
  },
): Promise<{ ok: true; application: StudentApplication } | { ok: false; error: string }> {
  const app = await getApplicantApplication(applicantId);
  if (!app) return { ok: false, error: "Application not found" };

  if (app.status !== "DRAFT" && app.status !== "DOCUMENTS_REQUIRED") {
    return { ok: false, error: "Application has already been submitted and is locked for editing." };
  }

  if (patch.currentStep) {
    app.currentStep = patch.currentStep;
  }
  if (patch.personalInfo) {
    app.personalInfo = { ...app.personalInfo, ...patch.personalInfo };
  }
  if (patch.qualifications) {
    app.qualifications = patch.qualifications as AcademicQualification[];
  }
  if (patch.programmeChoice) {
    app.programmeChoice = { ...app.programmeChoice, ...patch.programmeChoice } as ProgrammeChoice;
  }

  const saved = await saveStoredApplication(app);
  return { ok: true, application: saved };
}

export async function uploadApplicationDocument(
  applicantId: string,
  category: DocumentCategory,
  title: string,
  file: File,
): Promise<{ ok: true; application: StudentApplication; document: UploadedDocument } | { ok: false; error: string }> {
  const app = await getApplicantApplication(applicantId);
  if (!app) return { ok: false, error: "Application not found" };

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "File size exceeds the 5MB maximum limit." };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, error: "File format not supported. Allowed formats: PDF, JPG, PNG, WEBP." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: "Invalid file MIME type." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate actual magic bytes
  const isValidSignature = verifyFileMagicBytes(buffer, file.type, ext);
  if (!isValidSignature) {
    return { ok: false, error: "File content does not match its declared format. Upload rejected." };
  }

  const storedFilename = generateSafeStoredFilename(category, file.name);
  const filePath = await saveUploadedFile(app.id, storedFilename, buffer);

  const doc: UploadedDocument = {
    id: crypto.randomUUID(),
    category,
    title: title || category.replace(/_/g, " ").toUpperCase(),
    originalFilename: file.name,
    storedFilename,
    fileSize: file.size,
    mimeType: file.type,
    filePath,
    uploadedAt: new Date().toISOString(),
    verificationStatus: "pending",
  };

  const updated = await addApplicationDocument(app.id, doc);
  if (!updated) return { ok: false, error: "Failed to link document to application" };

  return { ok: true, application: updated, document: doc };
}

export async function deleteApplicationDocument(
  applicantId: string,
  documentId: string,
): Promise<{ ok: true; application: StudentApplication } | { ok: false; error: string }> {
  const app = await getApplicantApplication(applicantId);
  if (!app) return { ok: false, error: "Application not found" };

  if (app.status !== "DRAFT" && app.status !== "DOCUMENTS_REQUIRED") {
    return { ok: false, error: "Documents cannot be removed after application submission." };
  }

  const { app: updatedApp, removedDoc } = await removeApplicationDocument(app.id, documentId);
  if (!updatedApp) return { ok: false, error: "Failed to delete document" };

  if (removedDoc?.filePath) {
    await deleteStoredFile(removedDoc.filePath);
  }

  return { ok: true, application: updatedApp };
}

export async function submitApplication(
  applicantId: string,
  data: {
    personalInfo: PersonalInformation;
    qualifications: AcademicQualification[];
    programmeChoice: ProgrammeChoice;
    declarationConfirmed: boolean;
  },
): Promise<{ ok: true; application: StudentApplication } | { ok: false; error: string }> {
  const app = await getApplicantApplication(applicantId);
  if (!app) return { ok: false, error: "Application not found" };

  if (app.status !== "DRAFT" && app.status !== "DOCUMENTS_REQUIRED") {
    // Idempotent return: If already submitted, return current application successfully without recreating
    return { ok: true, application: app };
  }

  // Server-side validation
  if (!data.personalInfo.fullName || !data.personalInfo.email || !data.personalInfo.phone || !data.personalInfo.nicOrPassport) {
    return { ok: false, error: "Required personal information fields are missing." };
  }

  if (!data.qualifications || data.qualifications.length === 0) {
    return { ok: false, error: "Please provide at least one academic qualification." };
  }

  if (!data.programmeChoice.programmeId || !data.programmeChoice.programmeTitle) {
    return { ok: false, error: "Please select your chosen study programme." };
  }

  if (!data.declarationConfirmed) {
    return { ok: false, error: "You must confirm the application declaration before submitting." };
  }

  app.personalInfo = data.personalInfo;
  app.qualifications = data.qualifications;
  app.programmeChoice = data.programmeChoice;
  app.declarationConfirmed = true;
  app.declarationTimestamp = new Date().toISOString();
  app.status = "SUBMITTED";
  app.submittedAt = new Date().toISOString();
  app.currentStep = 5;

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: "Applicant",
    action: "Application submitted",
    details: `Application ${app.applicationNumber} submitted for ${app.programmeChoice.programmeTitle}`,
  });

  const saved = await saveStoredApplication(app);

  try {
    const pdfBuffer = await generateApplicationPdf(saved);
    await sendApplicationConfirmationEmail(saved, pdfBuffer);
  } catch (error) {
    console.error("[applicant/application/submit] Confirmation email failed:", error);
  }

  return { ok: true, application: saved };
}

/* -------------------------------------------------------------------------- */
/*                           Staff Admin Services                             */
/* -------------------------------------------------------------------------- */

export interface ApplicationAdminFilters {
  q?: string;
  status?: ApplicationStatus;
  programmeId?: string;
  intake?: string;
  page?: number;
  pageSize?: number;
}

export async function getAllApplicationsAdmin(filters?: ApplicationAdminFilters) {
  let list = await getStoredApplications();

  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.applicationNumber.toLowerCase().includes(q) ||
        a.personalInfo?.fullName?.toLowerCase().includes(q) ||
        a.personalInfo?.email?.toLowerCase().includes(q) ||
        a.personalInfo?.nicOrPassport?.toLowerCase().includes(q) ||
        a.programmeChoice?.programmeTitle?.toLowerCase().includes(q),
    );
  }

  if (filters?.status) {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters?.programmeId) {
    list = list.filter((a) => a.programmeChoice?.programmeId === filters.programmeId);
  }

  if (filters?.intake) {
    list = list.filter((a) => a.programmeChoice?.intake === filters.intake);
  }

  const total = list.length;
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 15;
  const startIndex = (page - 1) * pageSize;
  const paginated = list.slice(startIndex, startIndex + pageSize);

  return {
    applications: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getApplicationByIdAdmin(id: string): Promise<StudentApplication | null> {
  return findApplicationById(id);
}

export async function updateApplicationStatusAdmin(
  applicationId: string,
  newStatus: ApplicationStatus,
  staffName = "Admissions Officer",
  notes?: string,
): Promise<StudentApplication | null> {
  return updateApplicationStatus(applicationId, newStatus, staffName, notes);
}

export async function verifyDocumentAdmin(
  applicationId: string,
  documentId: string,
  status: DocumentVerificationStatus,
  rejectionReason?: string,
  staffName = "Document Verifier",
): Promise<StudentApplication | null> {
  return updateDocumentVerification(applicationId, documentId, status, rejectionReason, staffName);
}

export async function addAdminNoteToApplication(
  applicationId: string,
  noteText: string,
  staffName = "Admissions Staff",
  isInternal = true,
): Promise<StudentApplication | null> {
  return addApplicationNote(applicationId, {
    authorName: staffName,
    note: noteText,
    isInternal,
  });
}

export async function scheduleInterviewAdmin(
  applicationId: string,
  interview: InterviewDetails,
  staffName = "Admissions Officer",
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  app.interview = interview;
  app.status = "INTERVIEW_SCHEDULED";
  app.updatedAt = new Date().toISOString();

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: staffName,
    action: "Interview scheduled",
    details: `Interview scheduled on ${new Date(interview.scheduledAt).toLocaleString()} (${interview.venueOrLink})`,
  });

  return saveStoredApplication(app);
}

export async function requestDocumentsAdmin(
  applicationId: string,
  instructions: string,
  staffName = "Admissions Officer",
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  app.requestedDocumentsNotes = instructions;
  app.status = "DOCUMENTS_REQUIRED";
  app.updatedAt = new Date().toISOString();

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: staffName,
    action: "Additional documents requested",
    details: instructions,
  });

  return saveStoredApplication(app);
}
