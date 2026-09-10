import type {
  ApplicantAccount,
  ApplicationNote,
  ApplicationStatus,
  DocumentVerificationStatus,
  StudentApplication,
  UploadedDocument,
} from "@/types/admissions";
import { generateApplicationNumber } from "@/lib/admissions/crypto";
import { readJsonRecord, writeJsonRecord } from "@/lib/cms/json-store";

const ADMISSIONS_FILE = "admissions.json";

interface AdmissionsData {
  applicants: ApplicantAccount[];
  applications: StudentApplication[];
}

const initialData: AdmissionsData = {
  applicants: [],
  applications: [],
};

async function readAdmissionsData(): Promise<AdmissionsData> {
  const data = await readJsonRecord<AdmissionsData>(ADMISSIONS_FILE, initialData);
  return {
    applicants: Array.isArray(data.applicants) ? data.applicants : [],
    applications: Array.isArray(data.applications) ? data.applications : [],
  };
}

async function writeAdmissionsData(data: AdmissionsData): Promise<void> {
  await writeJsonRecord(ADMISSIONS_FILE, data);
}

/* -------------------------------------------------------------------------- */
/*                              Applicant Accounts                            */
/* -------------------------------------------------------------------------- */

export async function getStoredApplicants(): Promise<ApplicantAccount[]> {
  const data = await readAdmissionsData();
  return data.applicants;
}

export async function findApplicantByEmail(email: string): Promise<ApplicantAccount | null> {
  const applicants = await getStoredApplicants();
  const normalized = email.toLowerCase().trim();
  return applicants.find((a) => a.email.toLowerCase().trim() === normalized) || null;
}

export async function findApplicantById(id: string): Promise<ApplicantAccount | null> {
  const applicants = await getStoredApplicants();
  return applicants.find((a) => a.id === id) || null;
}

export async function createStoredApplicant(
  applicantData: Omit<ApplicantAccount, "id" | "createdAt" | "updatedAt">,
): Promise<ApplicantAccount> {
  const data = await readAdmissionsData();
  const newApplicant: ApplicantAccount = {
    ...applicantData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.applicants.push(newApplicant);
  await writeAdmissionsData(data);
  return newApplicant;
}

export async function updateStoredApplicant(
  id: string,
  patch: Partial<ApplicantAccount>,
): Promise<ApplicantAccount | null> {
  const data = await readAdmissionsData();
  const idx = data.applicants.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  data.applicants[idx] = {
    ...data.applicants[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeAdmissionsData(data);
  return data.applicants[idx];
}

/* -------------------------------------------------------------------------- */
/*                             Student Applications                           */
/* -------------------------------------------------------------------------- */

export async function getStoredApplications(): Promise<StudentApplication[]> {
  const data = await readAdmissionsData();
  return data.applications;
}

export async function findApplicationById(id: string): Promise<StudentApplication | null> {
  const apps = await getStoredApplications();
  return apps.find((a) => a.id === id) || null;
}

export async function findApplicationByNumber(appNumber: string): Promise<StudentApplication | null> {
  const apps = await getStoredApplications();
  return apps.find((a) => a.applicationNumber === appNumber) || null;
}

export async function getOrCreateApplicantDraft(
  applicantId: string,
  initialDataPartial?: Partial<StudentApplication>,
): Promise<StudentApplication> {
  // Single read for both the existing-draft lookup and the count below —
  // two separate readAdmissionsData() calls would each be their own
  // Supabase query round trip now that this store is backed by Supabase
  // rather than a near-free local fs read.
  const data = await readAdmissionsData();
  const draft = data.applications.find((a) => a.applicantId === applicantId && a.status === "DRAFT");
  if (draft) return draft;

  const count = data.applications.length + 1;
  const appNumber = generateApplicationNumber(count);

  const newApp: StudentApplication = {
    id: crypto.randomUUID(),
    applicationNumber: appNumber,
    applicantId,
    status: "DRAFT",
    currentStep: 1,
    personalInfo: initialDataPartial?.personalInfo || {
      fullName: "",
      nameWithInitials: "",
      dateOfBirth: "",
      civilStatus: "",
      nicOrPassport: "",
      email: "",
      phone: "",
      addressLine1: "",
      city: "",
      country: "Sri Lanka",
    },
    qualifications: initialDataPartial?.qualifications || [],
    professionalQualifications: initialDataPartial?.professionalQualifications || [],
    presentOccupation: initialDataPartial?.presentOccupation || [],
    programmeChoice: initialDataPartial?.programmeChoice || {
      programmeId: "",
      programmeTitle: "",
      programmeSlug: "",
      level: "Degree",
      intake: "2026 Intake",
      studyMode: "Hybrid",
      campus: "Kandy",
    },
    documents: [],
    timeline: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actor: "Applicant",
        action: "Application started",
        details: "Draft application created",
      },
    ],
    notes: [],
    declarationConfirmed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.applications.unshift(newApp);
  await writeAdmissionsData(data);
  return newApp;
}

export async function saveStoredApplication(
  application: StudentApplication,
): Promise<StudentApplication> {
  const data = await readAdmissionsData();
  const idx = data.applications.findIndex((a) => a.id === application.id);
  const updated = {
    ...application,
    updatedAt: new Date().toISOString(),
  };
  if (idx === -1) {
    data.applications.unshift(updated);
  } else {
    data.applications[idx] = updated;
  }
  await writeAdmissionsData(data);
  return updated;
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  actor = "System",
  details?: string,
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  app.status = newStatus;
  app.updatedAt = new Date().toISOString();
  if (newStatus === "SUBMITTED" && !app.submittedAt) {
    app.submittedAt = new Date().toISOString();
  }

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor,
    action: `Status changed to ${newStatus.replace(/_/g, " ")}`,
    details,
  });

  return saveStoredApplication(app);
}

export async function addApplicationDocument(
  applicationId: string,
  doc: UploadedDocument,
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  // Replace existing document in same category if only 1 is expected, or append
  const existingIdx = app.documents.findIndex((d) => d.id === doc.id || d.storedFilename === doc.storedFilename);
  if (existingIdx !== -1) {
    app.documents[existingIdx] = doc;
  } else {
    app.documents.push(doc);
  }

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: "Applicant",
    action: "Document uploaded",
    details: `Uploaded ${doc.title} (${doc.originalFilename})`,
  });

  return saveStoredApplication(app);
}

export async function removeApplicationDocument(
  applicationId: string,
  documentId: string,
): Promise<{ app: StudentApplication | null; removedDoc: UploadedDocument | null }> {
  const app = await findApplicationById(applicationId);
  if (!app) return { app: null, removedDoc: null };

  const docIdx = app.documents.findIndex((d) => d.id === documentId);
  if (docIdx === -1) return { app, removedDoc: null };

  const removedDoc = app.documents[docIdx];
  app.documents.splice(docIdx, 1);

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: "Applicant",
    action: "Document removed",
    details: `Removed ${removedDoc.title}`,
  });

  const updatedApp = await saveStoredApplication(app);
  return { app: updatedApp, removedDoc };
}

export async function updateDocumentVerification(
  applicationId: string,
  documentId: string,
  verificationStatus: DocumentVerificationStatus,
  rejectionReason?: string,
  staffName = "Admissions Staff",
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  const doc = app.documents.find((d) => d.id === documentId);
  if (!doc) return null;

  doc.verificationStatus = verificationStatus;
  doc.rejectionReason = verificationStatus === "rejected" ? rejectionReason : undefined;

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: staffName,
    action: `Document ${verificationStatus}`,
    details: `${doc.title}: ${verificationStatus}${rejectionReason ? ` - Reason: ${rejectionReason}` : ""}`,
  });

  return saveStoredApplication(app);
}

export async function addApplicationNote(
  applicationId: string,
  note: Omit<ApplicationNote, "id" | "createdAt">,
): Promise<StudentApplication | null> {
  const app = await findApplicationById(applicationId);
  if (!app) return null;

  const newNote: ApplicationNote = {
    ...note,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  app.notes.unshift(newNote);

  app.timeline.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: note.authorName,
    action: "Staff note added",
    details: note.isInternal ? "Internal staff note recorded" : "Message logged",
  });

  return saveStoredApplication(app);
}
