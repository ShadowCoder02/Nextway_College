import { describe, expect, it } from "vitest";
import { generateApplicationPdf } from "./pdf";
import type { StudentApplication } from "@/types/admissions";

// Regression guard for the production incident this file's own comments
// document: generateApplicationPdf() crashed on every real request
// ("Cannot find module '#standard-fonts/Helvetica'") despite every local
// `next build && next start` test passing, because the failure was
// specific to Vercel's deployed serverless bundle, not reproducible via
// plain Node module resolution. This test can't catch THAT class of bug
// (it runs under real Node, same blind spot) — but it does catch any
// future regression in the general generation logic (a bad field mapping
// throwing, a font path typo, a table-drawing bug), which local testing
// throughout that incident never had any coverage for at all.
function buildSampleApplication(): StudentApplication {
  return {
    id: "app_test",
    applicationNumber: "NWC-TEST-0001",
    applicantId: "applicant_test",
    status: "SUBMITTED",
    currentStep: 5,
    personalInfo: {
      title: "Mr",
      fullName: "Test Applicant",
      nameWithInitials: "T. Applicant",
      dateOfBirth: "2003-05-14",
      civilStatus: "Single",
      nicOrPassport: "200312345678",
      email: "test@example.com",
      phone: "0771234567",
      addressLine1: "123 Temple Road",
      city: "Kandy",
      country: "Sri Lanka",
    },
    qualifications: [
      {
        id: "ol",
        qualificationType: "GCE O/L",
        yearCompleted: "2019",
        subjectsAndGrades: [{ subject: "Mathematics", grade: "A" }],
      },
      {
        id: "al",
        qualificationType: "GCE A/L",
        yearCompleted: "",
        subjectsAndGrades: [],
      },
    ],
    professionalQualifications: [],
    presentOccupation: [],
    programmeChoice: {
      programmeId: "prog-1",
      programmeTitle: "BSc Information Technology",
      programmeSlug: "bsc-information-technology",
      level: "Degree",
      intake: "2026 January Intake",
      studyMode: "Hybrid",
      campus: "Kandy",
    },
    documents: [],
    timeline: [],
    notes: [],
    declarationConfirmed: true,
    signatureName: "Test Applicant",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };
}

describe("generateApplicationPdf", () => {
  it("returns a well-formed, non-trivial PDF buffer for a submitted application", async () => {
    const buffer = await generateApplicationPdf(buildSampleApplication());
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(10_000);
  });

  it("still generates a PDF when qualifications/documents are empty (draft-like data)", async () => {
    const app = buildSampleApplication();
    app.qualifications = [];
    app.documents = [];
    const buffer = await generateApplicationPdf(app);
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
