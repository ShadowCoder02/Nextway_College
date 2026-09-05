import PDFDocument from "pdfkit";
import type { StudentApplication } from "@/types/admissions";
import { formatDateTime } from "@/lib/utils";

export async function generateApplicationPdf(app: StudentApplication): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).text("Nextway College International", { align: "left" });
    doc.moveDown();
    doc.fontSize(14).text("Application Submission Confirmation", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Application ID: ${app.applicationNumber}`);
    doc.text(`Applicant: ${app.personalInfo.fullName}`);
    doc.text(`Email: ${app.personalInfo.email}`);
    doc.text(`Phone: ${app.personalInfo.phone}`);
    doc.text(`Programme: ${app.programmeChoice.programmeTitle}`);
    doc.text(`Campus: ${app.programmeChoice.campus}`);
    doc.text(`Intake: ${app.programmeChoice.intake}`);
    doc.text(`Submitted On: ${formatDateTime(app.submittedAt || app.updatedAt)}`);

    doc.moveDown();
    doc.fontSize(13).text("Personal Information", { underline: true });
    doc.text(`NIC / Passport: ${app.personalInfo.nicOrPassport}`);
    doc.text(`Date of Birth: ${app.personalInfo.dateOfBirth}`);
    doc.text(`Nationality: ${app.personalInfo.nationality}`);
    doc.text(`Address: ${app.personalInfo.addressLine1}, ${app.personalInfo.city}, ${app.personalInfo.country}`);
    doc.text(`Emergency Contact: ${app.personalInfo.emergencyContactName} (${app.personalInfo.emergencyContactRelationship}) - ${app.personalInfo.emergencyContactPhone}`);

    doc.moveDown();
    doc.fontSize(13).text("Academic Qualifications", { underline: true });
    app.qualifications.forEach((qualification, index) => {
      doc.text(`${index + 1}. ${qualification.qualificationType} - ${qualification.institution} (${qualification.yearCompleted})`);
      qualification.subjectsAndGrades.forEach((subject) => {
        doc.text(`   - ${subject.subject}: ${subject.grade}`);
      });
      if (qualification.remarks) doc.text(`   Remarks: ${qualification.remarks}`);
    });

    doc.moveDown();
    doc.fontSize(13).text("Required Documents", { underline: true });
    app.documents.forEach((document, index) => {
      doc.text(`${index + 1}. ${document.title} (${document.originalFilename})`);
    });

    doc.moveDown();
    doc.fontSize(12).text("This document is generated as a confirmation of your submitted application.");
    doc.text("Please retain this PDF for your records.");

    doc.end();
  });
}
