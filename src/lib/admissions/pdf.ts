import PDFDocument from "pdfkit";
import path from "path";
import { promises as fs } from "fs";
import type { StudentApplication } from "@/types/admissions";
import { formatDate } from "@/lib/utils";
import { readStoredFile } from "@/lib/admissions/file-security";

/**
 * Renders the official Nextway College International "Form of Application"
 * layout (bilingual English/Tamil field labels) pre-filled with the
 * applicant's submitted data, rather than a plain summary. Fields the
 * online multi-step form doesn't collect at all — Civil Status, Name with
 * Initials, a separate Contact Address, a Home telephone number, and the
 * Present Occupation history section — are rendered with their labels but
 * left blank, same as an applicant would leave them blank on the paper
 * form. Not fabricated: see CLAUDE.md's rule against inventing
 * institutional content.
 *
 * Tamil label text was transcribed from a photograph of the official paper
 * form, not a verified digital source — worth a native-speaker proofread
 * of the rendered PDF before this goes out to real applicants.
 */

const PAGE_MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 pt
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo.png");
const TAMIL_REGULAR_PATH = path.join(process.cwd(), "public", "fonts", "NotoSansTamil-Regular.woff");
const TAMIL_BOLD_PATH = path.join(process.cwd(), "public", "fonts", "NotoSansTamil-Bold.woff");

async function readFileIfExists(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

/** A field with an English label and (if the source form showed one for
 * this field) its Tamil counterpart, rendered as a two-line bilingual
 * label followed by an underline the value sits above. */
function bilingualField(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  englishLabel: string,
  tamilLabel: string | null,
  value: string,
): number {
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#000").text(englishLabel, x, y, { width });
  let cursorY = doc.y;
  if (tamilLabel) {
    doc.font("TamilRegular").fontSize(9).text(tamilLabel, x, cursorY, { width });
    cursorY = doc.y;
  }
  cursorY += 3;
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(value || "", x + 4, cursorY, { width: width - 8 });
  const valueY = Math.max(cursorY + 14, doc.y);
  doc
    .moveTo(x, valueY + 2)
    .lineTo(x + width, valueY + 2)
    .lineWidth(0.75)
    .strokeColor("#000")
    .stroke();
  return valueY + 10;
}

type TableColumn = { header: string; width: number };

function drawTable(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  columns: TableColumn[],
  rows: string[][],
  rowHeight = 20,
): number {
  doc.lineWidth(0.75).strokeColor("#000");

  doc.font("Helvetica-Bold").fontSize(9);
  // Narrow columns (e.g. "Date of Commencement") can wrap to two lines —
  // size the header row to the tallest wrapped header instead of a fixed
  // height, or a long header collides with the row drawn right below it.
  const headerHeight =
    Math.max(...columns.map((col) => doc.heightOfString(col.header, { width: col.width - 8 }))) + 12;

  let colX = x;
  for (const col of columns) {
    doc.rect(colX, y, col.width, headerHeight).stroke();
    doc.text(col.header, colX + 4, y + 6, { width: col.width - 8 });
    colX += col.width;
  }

  let rowY = y + headerHeight;
  doc.font("Helvetica").fontSize(9.5);
  for (const row of rows) {
    colX = x;
    for (let i = 0; i < columns.length; i++) {
      doc.rect(colX, rowY, columns[i].width, rowHeight).stroke();
      const cell = row[i] || "";
      doc.text(cell, colX + 4, rowY + 5, { width: columns[i].width - 8, ellipsis: true });
      colX += columns[i].width;
    }
    rowY += rowHeight;
  }

  return rowY;
}

export async function generateApplicationPdf(app: StudentApplication): Promise<Buffer> {
  const [logoBuffer, tamilRegular, tamilBold] = await Promise.all([
    readFileIfExists(LOGO_PATH),
    readFileIfExists(TAMIL_REGULAR_PATH),
    readFileIfExists(TAMIL_BOLD_PATH),
  ]);

  const photoDoc = app.documents.find((d) => d.category === "photograph");
  let photoBuffer: Buffer | null = null;
  if (photoDoc && (photoDoc.mimeType === "image/jpeg" || photoDoc.mimeType === "image/png")) {
    photoBuffer = await readStoredFile(photoDoc.filePath);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (tamilRegular) doc.registerFont("TamilRegular", tamilRegular);
    if (tamilBold) doc.registerFont("TamilBold", tamilBold);
    // Falls back to the Helvetica-only labels below if the font failed to
    // load (e.g. local dev missing public/fonts) rather than throwing —
    // this PDF must still generate even without Tamil rendering available.
    const tamil = (text: string) => (tamilRegular ? text : null);

    const { personalInfo, programmeChoice, qualifications } = app;

    /* ---------------------------- Page 1: header + particulars ---------------------------- */

    const headerTop = PAGE_MARGIN;
    if (logoBuffer) {
      doc.image(logoBuffer, PAGE_MARGIN, headerTop, { fit: [70, 70] });
    }
    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .text("NEXTWAY COLLEGE INTERNATIONAL (Pvt) Ltd", PAGE_MARGIN + 80, headerTop, {
        width: CONTENT_WIDTH - 80 - 130,
        align: "center",
      });
    doc.font("Helvetica-Bold").fontSize(11).text("SRI LANKA", { width: CONTENT_WIDTH - 80 - 130, align: "center" });
    doc.moveDown(0.3);
    doc.font("Helvetica-Bold").fontSize(13).text("FORM OF APPLICATION", { width: CONTENT_WIDTH - 80 - 130, align: "center" });

    const photoBoxX = PAGE_MARGIN + CONTENT_WIDTH - 110;
    const photoBoxW = 110;
    const photoBoxH = 130;
    doc.lineWidth(1).strokeColor("#000").rect(photoBoxX, headerTop, photoBoxW, photoBoxH).stroke();
    if (photoBuffer) {
      try {
        doc.image(photoBuffer, photoBoxX + 4, headerTop + 4, { fit: [photoBoxW - 8, photoBoxH - 8], align: "center", valign: "center" });
      } catch {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text("Student Photo\nPassport Size", photoBoxX + 8, headerTop + 55, { width: photoBoxW - 16, align: "center" });
      }
    } else {
      doc
        .font("Helvetica")
        .fontSize(9)
        .text("Student Photo\nPassport Size", photoBoxX + 8, headerTop + 55, { width: photoBoxW - 16, align: "center" });
    }

    let cursorY = headerTop + 145;

    // COURSE APPLIED FOR
    doc.lineWidth(1).strokeColor("#000").rect(PAGE_MARGIN, cursorY, CONTENT_WIDTH, 46).stroke();
    doc.font("Helvetica-Bold").fontSize(10).text("COURSE APPLIED FOR:", PAGE_MARGIN + 6, cursorY + 5, { width: 220 });
    const courseLabel = tamil("தெரிவு செய்யும் பாடநெறி");
    if (courseLabel) doc.font("TamilRegular").fontSize(9).text(courseLabel, PAGE_MARGIN + 6, doc.y, { width: 220 });
    doc.font("Helvetica").fontSize(11).text(programmeChoice.programmeTitle || "", PAGE_MARGIN + 230, cursorY + 16, {
      width: CONTENT_WIDTH - 236,
    });
    cursorY += 46 + 14;

    const halfWidth = (CONTENT_WIDTH - 20) / 2;

    // 01(a) Name in Full / (b) Name with initials
    doc.font("Helvetica-Bold").fontSize(10).text("01. (a) Name in Full: (Mr/Mrs/Miss — underline the Surname)", PAGE_MARGIN, cursorY, { width: CONTENT_WIDTH });
    cursorY = doc.y;
    const nameLabel = tamil("முதல் பெயர்");
    if (nameLabel) {
      doc.font("TamilRegular").fontSize(9).text(nameLabel, PAGE_MARGIN + 20, cursorY, { width: CONTENT_WIDTH - 20 });
      cursorY = doc.y;
    }
    const fullNameValue = [personalInfo.title, personalInfo.fullName].filter(Boolean).join(" ");
    doc.font("Helvetica").fontSize(11).text(fullNameValue, PAGE_MARGIN + 20, cursorY + 4, { width: CONTENT_WIDTH - 20 });
    cursorY = doc.y + 4;
    doc.moveTo(PAGE_MARGIN, cursorY).lineTo(PAGE_MARGIN + CONTENT_WIDTH, cursorY).lineWidth(0.75).stroke();
    cursorY += 12;

    doc.font("Helvetica-Bold").fontSize(10).text("(b) Name with initials", PAGE_MARGIN, cursorY, { width: 200 });
    const initialsLabel = tamil("முதலெழுத்துடன் பெயர்");
    if (initialsLabel) doc.font("TamilRegular").fontSize(9).text(initialsLabel, PAGE_MARGIN, doc.y, { width: 200 });
    // Not collected by the online application — left blank, matching an
    // applicant leaving it blank on paper (see the module-level comment).
    doc.moveTo(PAGE_MARGIN + 210, cursorY + 10).lineTo(PAGE_MARGIN + CONTENT_WIDTH, cursorY + 10).lineWidth(0.75).stroke();
    cursorY += 30;

    // 02(a) Permanent Address / (b) Contact Address / (c) Telephone
    const permAddressValue = [personalInfo.addressLine1, personalInfo.city, personalInfo.postalCode, personalInfo.country]
      .filter(Boolean)
      .join(", ");
    cursorY = bilingualField(doc, PAGE_MARGIN, cursorY, CONTENT_WIDTH, "02. (a) Permanent Address", tamil("நிரந்தர முகவரி"), permAddressValue);

    // Not collected as a distinct field — addressLine2, if the applicant
    // gave one, is the closest equivalent; otherwise left blank.
    cursorY = bilingualField(
      doc,
      PAGE_MARGIN,
      cursorY,
      CONTENT_WIDTH,
      "(b) Contact Address (if different from permanent address)",
      tamil("தொடர்பு முகவரி"),
      personalInfo.addressLine2 || "",
    );

    doc.font("Helvetica-Bold").fontSize(10).text("(c) Contact Telephone No.", PAGE_MARGIN, cursorY, { width: CONTENT_WIDTH });
    cursorY = doc.y + 4;
    // Mixed English/Tamil on one line needs separate font-switched
    // `continued` segments — a Tamil-subset font has no Latin parenthesis
    // glyphs, so wrapping the whole "(label)" string in one .text() call
    // under the Tamil font renders the parens as tofu boxes.
    const homeLabel = tamil("வீடு");
    doc.font("Helvetica").fontSize(10).text("Home (", PAGE_MARGIN, cursorY, { continued: true });
    if (homeLabel) doc.font("TamilRegular").fontSize(9).text(homeLabel, { continued: true });
    doc.font("Helvetica").fontSize(10).text(")");
    doc.moveTo(PAGE_MARGIN + 85, cursorY + 12).lineTo(PAGE_MARGIN + halfWidth, cursorY + 12).lineWidth(0.75).stroke();

    const mobileX = PAGE_MARGIN + halfWidth + 20;
    const mobileLabel = tamil("கையடக்கம்");
    doc.font("Helvetica").fontSize(10).text("Mobile (", mobileX, cursorY, { continued: true });
    if (mobileLabel) doc.font("TamilRegular").fontSize(9).text(mobileLabel, { continued: true });
    doc.font("Helvetica").fontSize(10).text(")");
    doc.font("Helvetica").fontSize(10).text(personalInfo.phone || "", mobileX + 105, cursorY, { width: PAGE_MARGIN + CONTENT_WIDTH - (mobileX + 105) });
    doc.moveTo(mobileX + 105, cursorY + 12).lineTo(PAGE_MARGIN + CONTENT_WIDTH, cursorY + 12).lineWidth(0.75).stroke();
    cursorY += 26;

    // 03. NIC
    cursorY = bilingualField(doc, PAGE_MARGIN, cursorY, CONTENT_WIDTH, "03. National Identity Card No.", tamil("தேசிய அடையாள அட்டை இலக்கம்"), personalInfo.nicOrPassport);

    // 04(a) DOB / 05. Civil Status side by side
    const dobValue = personalInfo.dateOfBirth ? formatDate(personalInfo.dateOfBirth) : "";
    const rowY = cursorY;
    const afterDob = bilingualField(doc, PAGE_MARGIN, rowY, halfWidth, "04. (a) Date of Birth", tamil("பிறந்த திகதி"), dobValue);
    // Not collected — left blank (see module-level comment).
    const afterCivil = bilingualField(doc, PAGE_MARGIN + halfWidth + 20, rowY, halfWidth, "05. Civil Status", tamil("விவாக நிலை"), "");
    cursorY = Math.max(afterDob, afterCivil);

    /* ---------------------------- Page 2: qualifications, occupation, declaration ---------------------------- */
    doc.addPage();
    cursorY = PAGE_MARGIN;

    const olQual = qualifications.find((q) => q.qualificationType === "GCE O/L");
    const alQual = qualifications.find((q) => q.qualificationType === "GCE A/L");
    const otherQuals = qualifications.filter((q) => q.qualificationType !== "GCE O/L" && q.qualificationType !== "GCE A/L");

    doc.font("Helvetica-Bold").fontSize(11).text("07. Qualifications — (Certified copies of the certificates should be attached)", PAGE_MARGIN, cursorY, { width: CONTENT_WIDTH });
    cursorY = doc.y + 6;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`G.C.E. (O/L) Year: ${olQual?.yearCompleted || ""}    Index No: ${olQual?.indexOrRegNumber || ""}`, PAGE_MARGIN, cursorY, {
        width: CONTENT_WIDTH,
      });
    cursorY = doc.y + 8;
    const olRows = (olQual?.subjectsAndGrades || []).map((s) => [s.subject, s.grade]);
    while (olRows.length < 6) olRows.push(["", ""]);
    cursorY = drawTable(
      doc,
      PAGE_MARGIN,
      cursorY,
      [
        { header: "Subject", width: CONTENT_WIDTH - 120 },
        { header: "Grade", width: 120 },
      ],
      olRows,
    );
    cursorY += 16;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`08. G.C.E. (A/L) Year: ${alQual?.yearCompleted || ""}    Index No: ${alQual?.indexOrRegNumber || ""}`, PAGE_MARGIN, cursorY, {
        width: CONTENT_WIDTH,
      });
    cursorY = doc.y + 8;
    const alRows = (alQual?.subjectsAndGrades || []).map((s) => [s.subject, s.grade]);
    while (alRows.length < 4) alRows.push(["", ""]);
    cursorY = drawTable(
      doc,
      PAGE_MARGIN,
      cursorY,
      [
        { header: "Subject", width: CONTENT_WIDTH - 120 },
        { header: "Grade", width: 120 },
      ],
      alRows,
    );
    cursorY += 16;

    doc.font("Helvetica-Bold").fontSize(10).text("09. Professional Qualifications:", PAGE_MARGIN, cursorY, { width: CONTENT_WIDTH });
    cursorY = doc.y + 8;
    // Only Institution and Qualifications Obtained have a real source field
    // (yearCompleted doesn't cleanly correspond to any of Date of
    // Commencement/Effective Date/Duration, so it's not forced into one —
    // that would misrepresent what "year completed" actually means).
    const profRows = otherQuals.length
      ? otherQuals.map((q) => [q.institution, q.qualificationType, "", "", ""])
      : [["", "", "", "", ""]];
    cursorY = drawTable(
      doc,
      PAGE_MARGIN,
      cursorY,
      [
        { header: "Institution", width: 110 },
        { header: "Qualifications Obtained", width: 130 },
        { header: "Date of Commencement", width: 90 },
        { header: "Effective Date", width: 80 },
        { header: "Duration", width: CONTENT_WIDTH - 110 - 130 - 90 - 80 },
      ],
      profRows,
    );
    cursorY += 16;

    // Not collected by the online application — table rendered with
    // headers only, matching an applicant leaving it blank on paper.
    doc.font("Helvetica-Bold").fontSize(10).text("10. (a) Present Occupation", PAGE_MARGIN, cursorY, { width: CONTENT_WIDTH });
    cursorY = doc.y + 8;
    cursorY = drawTable(
      doc,
      PAGE_MARGIN,
      cursorY,
      [
        { header: "Occupation", width: 90 },
        { header: "Institute", width: 110 },
        { header: "From", width: 60 },
        { header: "To", width: 60 },
        { header: "No. of months", width: 90 },
        { header: "Last salary drawn", width: CONTENT_WIDTH - 90 - 110 - 60 - 60 - 90 },
      ],
      [["", "", "", "", "", ""]],
    );
    cursorY += 24;

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(
        "I do hereby certify that particulars submitted by me in this application are true and accurate. I am aware that if any of these particulars are found to be false or inaccurate, I am liable to be disqualified before Final Examination.",
        PAGE_MARGIN,
        cursorY,
        { width: CONTENT_WIDTH },
      );
    cursorY = doc.y + 40;

    doc.font("Helvetica").fontSize(10).text("......................................................", PAGE_MARGIN + CONTENT_WIDTH - 220, cursorY, { width: 220, align: "center" });
    doc.text("Signature of Applicant", PAGE_MARGIN + CONTENT_WIDTH - 220, doc.y, { width: 220, align: "center" });

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Date: ${app.submittedAt ? formatDate(app.submittedAt) : ""}`, PAGE_MARGIN, cursorY + 4, { width: 220 });

    doc.end();
  });
}
