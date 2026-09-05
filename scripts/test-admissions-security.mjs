import assert from "assert";
import {
  hashPassword,
  verifyPassword,
  generateApplicationNumber,
  signToken,
  verifySignedToken,
} from "../src/lib/admissions/crypto.ts";
import {
  verifyFileMagicBytes,
  generateSafeStoredFilename,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../src/lib/admissions/file-security.ts";
import { checkRateLimit, resetRateLimit } from "../src/lib/admissions/rate-limiter.ts";
import {
  registerApplicant,
  authenticateApplicant,
  getApplicantApplication,
  saveApplicationDraft,
  submitApplication,
  getAllApplicationsAdmin,
  updateApplicationStatusAdmin,
  verifyDocumentAdmin,
  addAdminNoteToApplication,
  scheduleInterviewAdmin,
  requestDocumentsAdmin,
} from "../src/services/admissions.ts";

async function runSecurityAndFunctionalTests() {
  console.log("=================================================");
  console.log("   ONLINE ADMISSIONS PORTAL - TEST & AUDIT SUITE ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  /* ---------------- 1. Cryptographic Security Tests ---------------- */
  console.log("--- 1. Cryptography & Password Security ---");

  await asyncTest("scrypt password hashing and verification", async () => {
    const rawPass = "NextwayStudent@2026";
    const { hash, salt } = await hashPassword(rawPass);
    assert(hash && hash.length === 128, "Hash should be 64 bytes in hex");
    assert(salt && salt.length === 32, "Salt should be 16 bytes in hex");

    const match = await verifyPassword(rawPass, hash, salt);
    assert(match === true, "Correct password should verify");

    const wrongMatch = await verifyPassword("WrongPassword123", hash, salt);
    assert(wrongMatch === false, "Incorrect password should fail");
  });

  test("Session signature creation and tamper rejection", () => {
    const payload = "applicant_123456789";
    const signed = signToken(payload);
    assert(signed.startsWith(payload), "Signed token should contain payload");

    const verified = verifySignedToken(signed);
    assert.strictEqual(verified, payload, "Valid signature must verify");

    // Tamper test
    const tampered = payload + "tampered." + signed.split(".")[1];
    const tamperedResult = verifySignedToken(tampered);
    assert.strictEqual(tamperedResult, null, "Tampered payload must be rejected");
  });

  test("Application number format generator", () => {
    const year = new Date().getFullYear();
    const appNum = generateApplicationNumber(42);
    assert.strictEqual(appNum, `APP-${year}-000042`);
  });

  /* ---------------- 2. Rate Limiting Tests ---------------- */
  console.log("\n--- 2. Brute-Force Rate Limiting ---");

  test("Rate limiter enforces request threshold and window", () => {
    const testKey = "test_ip_rate_limit_123";
    resetRateLimit(testKey);

    for (let i = 1; i <= 5; i++) {
      const res = checkRateLimit(testKey, 5, 1000);
      assert.strictEqual(res.allowed, true, `Request ${i} should be allowed`);
    }

    const blockedRes = checkRateLimit(testKey, 5, 1000);
    assert.strictEqual(blockedRes.allowed, false, "Request 6 should be blocked");
    assert.strictEqual(blockedRes.remaining, 0);
    assert(blockedRes.retryAfterSeconds > 0);
  });

  /* ---------------- 3. File Security & Magic Byte Inspection ---------------- */
  console.log("\n--- 3. File Security & Signature Validation ---");

  test("Magic byte inspection detects real PDF vs fake PDF", () => {
    // Valid PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc4, 0xe5]);
    assert.strictEqual(verifyFileMagicBytes(validPdfBuffer, "application/pdf", ".pdf"), true);

    // Fake PDF with executable/script content:
    const fakePdfBuffer = Buffer.from("<?php echo 'malicious'; ?>", "utf-8");
    assert.strictEqual(verifyFileMagicBytes(fakePdfBuffer, "application/pdf", ".pdf"), false);
  });

  test("Magic byte inspection for JPEG and PNG", () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    assert.strictEqual(verifyFileMagicBytes(validJpeg, "image/jpeg", ".jpg"), true);

    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    assert.strictEqual(verifyFileMagicBytes(validPng, "image/png", ".png"), true);
  });

  test("Sanitized stored filename prevents path traversal", () => {
    const maliciousFilename = "../../../../etc/passwd.exe";
    const safeName = generateSafeStoredFilename("nic_passport", maliciousFilename);
    assert(!safeName.includes(".."), "Stored filename must not contain directory traversal");
    assert(!safeName.endsWith(".exe"), "Executable extension should not be preserved if not allowed");
  });

  /* ---------------- 4. End-to-End Functional Journey ---------------- */
  console.log("\n--- 4. End-to-End Applicant & Admin Journey ---");

  const testEmail = `test_applicant_${Date.now()}@nextway.edu.lk`;
  let applicantId = "";
  let applicationId = "";

  await asyncTest("Register new applicant", async () => {
    const regRes = await registerApplicant({
      fullName: "Kavindu Madushanka",
      email: testEmail,
      phone: "+94771234567",
      password: "Password@2026",
    });
    assert.strictEqual(regRes.ok, true);
    assert(regRes.applicant.id);
    applicantId = regRes.applicant.id;
  });

  await asyncTest("Duplicate registration prevention", async () => {
    const dupRes = await registerApplicant({
      fullName: "Duplicate User",
      email: testEmail,
      phone: "+94771234567",
      password: "Password@2026",
    });
    assert.strictEqual(dupRes.ok, false);
    assert(dupRes.error.includes("already exists"));
  });

  await asyncTest("Authenticate registered applicant", async () => {
    const authRes = await authenticateApplicant(testEmail, "Password@2026");
    assert.strictEqual(authRes.ok, true);
    assert.strictEqual(authRes.session.email, testEmail);

    const failAuth = await authenticateApplicant(testEmail, "WrongPass123");
    assert.strictEqual(failAuth.ok, false);
  });

  await asyncTest("Create draft application and save progressive steps", async () => {
    const app = await getApplicantApplication(applicantId);
    assert(app);
    assert.strictEqual(app.status, "DRAFT");
    applicationId = app.id;

    // Save Step 1 & 2
    const draftSave = await saveApplicationDraft(applicantId, {
      currentStep: 2,
      personalInfo: {
        fullName: "Kavindu Madushanka",
        dateOfBirth: "2002-05-15",
        gender: "Male",
        nationality: "Sri Lankan",
        nicOrPassport: "200213501234",
        email: testEmail,
        phone: "+94771234567",
        addressLine1: "123 Peradeniya Road",
        city: "Kandy",
        country: "Sri Lanka",
        emergencyContactName: "Kamal Madushanka",
        emergencyContactPhone: "+94779876543",
        emergencyContactRelationship: "Father",
      },
      qualifications: [
        {
          id: "qual_1",
          institution: "Dharmaraja College",
          qualificationType: "GCE A/L",
          yearCompleted: "2022",
          subjectsAndGrades: [
            { subject: "Combined Mathematics", grade: "A" },
            { subject: "Physics", grade: "B" },
            { subject: "Chemistry", grade: "B" },
          ],
        },
      ],
      programmeChoice: {
        programmeId: "prog_bsc_it",
        programmeTitle: "BSc (Hons) in Information Technology",
        programmeSlug: "bsc-information-technology",
        level: "Degree",
        intake: "2026 January Intake",
        studyMode: "Hybrid",
        campus: "Kandy (Main Campus)",
      },
    });

    assert.strictEqual(draftSave.ok, true);
    assert.strictEqual(draftSave.application.qualifications.length, 1);
  });

  await asyncTest("Final application submission with server validation", async () => {
    const submitRes = await submitApplication(applicantId, {
      personalInfo: {
        fullName: "Kavindu Madushanka",
        dateOfBirth: "2002-05-15",
        gender: "Male",
        nationality: "Sri Lankan",
        nicOrPassport: "200213501234",
        email: testEmail,
        phone: "+94771234567",
        addressLine1: "123 Peradeniya Road",
        city: "Kandy",
        country: "Sri Lanka",
        emergencyContactName: "Kamal Madushanka",
        emergencyContactPhone: "+94779876543",
        emergencyContactRelationship: "Father",
      },
      qualifications: [
        {
          id: "qual_1",
          institution: "Dharmaraja College",
          qualificationType: "GCE A/L",
          yearCompleted: "2022",
          subjectsAndGrades: [
            { subject: "Combined Mathematics", grade: "A" },
            { subject: "Physics", grade: "B" },
            { subject: "Chemistry", grade: "B" },
          ],
        },
      ],
      programmeChoice: {
        programmeId: "prog_bsc_it",
        programmeTitle: "BSc (Hons) in Information Technology",
        programmeSlug: "bsc-information-technology",
        level: "Degree",
        intake: "2026 January Intake",
        studyMode: "Hybrid",
        campus: "Kandy (Main Campus)",
      },
      declarationConfirmed: true,
    });

    assert.strictEqual(submitRes.ok, true);
    assert.strictEqual(submitRes.application.status, "SUBMITTED");
    assert(submitRes.application.submittedAt);
  });

  await asyncTest("Admin management: review, status workflow, notes, interview", async () => {
    // 1. Staff query
    const listRes = await getAllApplicationsAdmin({ q: "Kavindu" });
    assert(listRes.applications.length >= 1);

    // 2. Add internal note
    const noteApp = await addAdminNoteToApplication(
      applicationId,
      "Strong Mathematics background. Recommended for faculty interview.",
      "Admissions Dean",
    );
    assert.strictEqual(noteApp.notes.length >= 1, true);

    // 3. Schedule interview
    const interviewApp = await scheduleInterviewAdmin(applicationId, {
      scheduledAt: "2026-10-15T10:00:00Z",
      venueOrLink: "https://meet.nextway.edu.lk/adm-101",
      instructions: "Bring original A/L certificates",
    });
    assert.strictEqual(interviewApp.status, "INTERVIEW_SCHEDULED");
    assert(interviewApp.interview);

    // 4. Approve application
    const approvedApp = await updateApplicationStatusAdmin(
      applicationId,
      "APPROVED",
      "Admissions Board",
      "Offer made for 2026 January intake",
    );
    assert.strictEqual(approvedApp.status, "APPROVED");
  });

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAndFunctionalTests().catch((err) => {
  console.error("Test Suite Crashed:", err);
  process.exit(1);
});
