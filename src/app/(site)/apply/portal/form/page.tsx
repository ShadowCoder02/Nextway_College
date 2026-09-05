"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApplicationStepper } from "@/components/applicant/ApplicationStepper";
import { DocumentUploader } from "@/components/applicant/DocumentUploader";
import { Button } from "@/components/ui/Button";
import type {
  AcademicQualification,
  PersonalInformation,
  ProgrammeChoice,
  StudentApplication,
  UploadedDocument,
} from "@/types/admissions";
import type { Programme } from "@/types";
import { BRANCHES } from "@/constants/site";

export default function ApplicationFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const [appNumber, setAppNumber] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Available programmes from DB
  const [programmesList, setProgrammesList] = useState<Programme[]>([]);

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState<PersonalInformation>({
    title: "Mr",
    fullName: "",
    preferredName: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "Sri Lankan",
    nicOrPassport: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "Parent",
  });

  // Step 2: Qualifications
  const [qualifications, setQualifications] = useState<AcademicQualification[]>([
    {
      id: "qual_default_1",
      institution: "",
      qualificationType: "GCE O/L",
      yearCompleted: "",
      indexOrRegNumber: "",
      subjectsAndGrades: [
        { subject: "Mathematics", grade: "A" },
        { subject: "English", grade: "A" },
        { subject: "Science", grade: "B" },
      ],
      remarks: "",
    },
  ]);

  // Step 3: Programme Selection
  const [programmeChoice, setProgrammeChoice] = useState<ProgrammeChoice>({
    programmeId: "",
    programmeTitle: "",
    programmeSlug: "",
    level: "Degree",
    intake: "2026 January Intake",
    studyMode: "Hybrid",
    campus: "Kandy (Main Campus)",
  });

  // Step 4: Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Step 5: Declaration
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        // 1. Fetch current application
        const appRes = await fetch("/api/applicant/application");
        if (appRes.status === 401) {
          router.push("/apply/login");
          return;
        }

        const appData = await appRes.json();
        if (appRes.ok && appData.ok && appData.application) {
          const a: StudentApplication = appData.application;
          setAppNumber(a.applicationNumber);
          if (a.personalInfo) setPersonalInfo((prev) => ({ ...prev, ...a.personalInfo }));
          if (a.qualifications?.length) setQualifications(a.qualifications);
          if (a.programmeChoice?.programmeId) setProgrammeChoice(a.programmeChoice);
          if (a.documents) setDocuments(a.documents);
          if (a.declarationConfirmed) setDeclarationConfirmed(a.declarationConfirmed);

          const stepParam = searchParams.get("step");
          if (stepParam) {
            const stepNum = parseInt(stepParam, 10);
            if (stepNum >= 1 && stepNum <= 5) setCurrentStep(stepNum);
          } else if (a.currentStep) {
            setCurrentStep(a.currentStep);
          }
        }

        // 2. Fetch programmes
        const progRes = await fetch("/api/portal/programmes");
        if (progRes.ok) {
          const progData = await progRes.json();
          if (Array.isArray(progData)) {
            setProgrammesList(progData.filter((p: Programme) => p.status === "published"));
          }
        }
      } catch (err) {
        console.error("[form init] Error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, searchParams]);

  // Handle preselected programme query parameter
  useEffect(() => {
    const progSlugParam = searchParams.get("programme");
    if (progSlugParam && programmesList.length > 0) {
      const found = programmesList.find((p) => p.slug === progSlugParam);
      if (found) {
        setProgrammeChoice((prev) => ({
          ...prev,
          programmeId: found.id,
          programmeTitle: found.title,
          programmeSlug: found.slug,
          level: found.level,
        }));
      }
    }
  }, [searchParams, programmesList]);

  // Save Draft Helper
  async function saveDraft(targetStep?: number): Promise<boolean> {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/applicant/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: targetStep || currentStep,
          personalInfo,
          qualifications,
          programmeChoice,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Failed to save draft.");
        setSaving(false);
        return false;
      }
      setSuccessToast("Progress saved successfully.");
      setTimeout(() => setSuccessToast(""), 3000);
      setSaving(false);
      return true;
    } catch {
      setErrorMsg("Network error saving draft.");
      setSaving(false);
      return false;
    }
  }

  // Next Step validation & transition
  async function handleNextStep() {
    setErrorMsg("");

    // Validate Step 1
    if (currentStep === 1) {
      if (!personalInfo.fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!personalInfo.email.trim() || !personalInfo.email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (!personalInfo.phone.trim()) {
        setErrorMsg("Please enter your phone number.");
        return;
      }
      if (!personalInfo.nicOrPassport.trim()) {
        setErrorMsg("Please enter your NIC or Passport number.");
        return;
      }
      if (!personalInfo.dateOfBirth) {
        setErrorMsg("Please enter your date of birth.");
        return;
      }
      if (!personalInfo.addressLine1.trim() || !personalInfo.city.trim()) {
        setErrorMsg("Please complete your address and city.");
        return;
      }
      if (!personalInfo.emergencyContactName.trim() || !personalInfo.emergencyContactPhone.trim()) {
        setErrorMsg("Please provide emergency contact details.");
        return;
      }
    }

    // Validate Step 2
    if (currentStep === 2) {
      if (qualifications.length === 0) {
        setErrorMsg("Please add at least one academic qualification.");
        return;
      }
      const invalidQual = qualifications.find((q) => !q.institution.trim() || !q.yearCompleted.trim());
      if (invalidQual) {
        setErrorMsg("Please specify institution name and year for all qualifications.");
        return;
      }
    }

    // Validate Step 3
    if (currentStep === 3) {
      if (!programmeChoice.programmeId || !programmeChoice.programmeTitle) {
        setErrorMsg("Please select your chosen programme of study.");
        return;
      }
      if (!programmeChoice.intake) {
        setErrorMsg("Please select your preferred intake.");
        return;
      }
    }

    // Validate Step 4
    if (currentStep === 4) {
      const hasNic = documents.some((d) => d.category === "nic_passport");
      if (!hasNic) {
        setErrorMsg("Please upload your NIC or Passport copy before continuing.");
        return;
      }
    }

    const nextStepNum = currentStep + 1;
    const ok = await saveDraft(nextStepNum);
    if (ok) {
      setCurrentStep(nextStepNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrevStep() {
    setErrorMsg("");
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Final Submit
  async function handleFinalSubmit() {
    if (!declarationConfirmed) {
      setErrorMsg("You must confirm the declaration to submit your application.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/applicant/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo,
          qualifications,
          programmeChoice,
          declarationConfirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Submission failed. Please check your information and try again.");
        setSubmitting(false);
        return;
      }

      startTransition(() => {
        router.push("/apply/portal");
        router.refresh();
      });
    } catch {
      setErrorMsg("Network error during submission. Please try again.");
      setSubmitting(false);
    }
  }

  /* ---------------- Qualification Modifiers ---------------- */
  function addQualification() {
    setQualifications((prev) => [
      ...prev,
      {
        id: "qual_" + Date.now(),
        institution: "",
        qualificationType: "GCE A/L",
        yearCompleted: "",
        indexOrRegNumber: "",
        subjectsAndGrades: [
          { subject: "Subject 1", grade: "A" },
          { subject: "Subject 2", grade: "B" },
          { subject: "Subject 3", grade: "C" },
        ],
        remarks: "",
      },
    ]);
  }

  function removeQualification(id: string) {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQualificationField<K extends keyof AcademicQualification>(
    id: string,
    field: K,
    value: AcademicQualification[K],
  ) {
    setQualifications((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  }

  function addSubjectRow(qualId: string) {
    setQualifications((prev) =>
      prev.map((q) =>
        q.id === qualId
          ? { ...q, subjectsAndGrades: [...q.subjectsAndGrades, { subject: "", grade: "" }] }
          : q,
      ),
    );
  }

  function updateSubjectRow(qualId: string, subIdx: number, field: "subject" | "grade", val: string) {
    setQualifications((prev) =>
      prev.map((q) => {
        if (q.id !== qualId) return q;
        const copy = [...q.subjectsAndGrades];
        copy[subIdx] = { ...copy[subIdx], [field]: val };
        return { ...q, subjectsAndGrades: copy };
      }),
    );
  }

  function removeSubjectRow(qualId: string, subIdx: number) {
    setQualifications((prev) =>
      prev.map((q) => {
        if (q.id !== qualId) return q;
        const copy = q.subjectsAndGrades.filter((_, idx) => idx !== subIdx);
        return { ...q, subjectsAndGrades: copy };
      }),
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-pearl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="text-sm font-semibold text-navy">Preparing Application Form...</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <div className="bg-pearl min-h-screen py-8 sm:py-12">
      <div className="container-nwc max-w-4xl">
        {/* Top Navigation Strip */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/apply/portal" className="text-xs font-bold text-navy hover:text-brand-red transition flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            {appNumber && <span className="text-xs font-mono text-slate">App #{appNumber}</span>}
            <button
              type="button"
              disabled={saving}
              onClick={() => saveDraft()}
              className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-navy hover:bg-gold hover:text-white transition"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="premium-card p-6 mb-8">
          <ApplicationStepper currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error flex items-center justify-between">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg("")} className="text-xs underline ml-4">Dismiss</button>
          </div>
        )}

        {successToast && (
          <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">
            {successToast}
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="premium-card p-6 sm:p-10 mb-8">
          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Step 1 — Personal Information</h2>
                <p className="text-xs text-slate mt-1">
                  Please enter your official personal and contact details as verified on your legal identity documents.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Title</label>
                  <select
                    className={inputClass}
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                    <option value="Rev">Rev</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Full Name (as in NIC / Passport) *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    placeholder="e.g. Johnathan Alexander Perera"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    className={inputClass}
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Gender *</label>
                  <select
                    className={inputClass}
                    value={personalInfo.gender}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        gender: e.target.value as PersonalInformation["gender"],
                      })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Nationality *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={personalInfo.nationality}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                    placeholder="Sri Lankan"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">NIC or Passport No *</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    value={personalInfo.nicOrPassport}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nicOrPassport: e.target.value })}
                    placeholder="200012345678 or N1234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Mobile Contact No *</label>
                  <input
                    type="tel"
                    required
                    className={inputClass}
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>
              </div>

              <div className="border-t border-slate/15 pt-4 space-y-4">
                <h3 className="font-bold text-navy text-sm">Permanent Residential Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.addressLine1}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, addressLine1: e.target.value })}
                      placeholder="Street address / House No"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                      placeholder="Kandy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Postal Code</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={personalInfo.postalCode || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                      placeholder="20800"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate/15 pt-4 space-y-4">
                <h3 className="font-bold text-navy text-sm">Emergency / Guardian Contact</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.emergencyContactName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
                      placeholder="Parent or Guardian"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      className={inputClass}
                      value={personalInfo.emergencyContactPhone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactPhone: e.target.value })}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Relationship *</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.emergencyContactRelationship}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactRelationship: e.target.value })}
                      placeholder="Mother / Father / Guardian"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC QUALIFICATIONS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-navy">Step 2 — Academic Qualifications</h2>
                  <p className="text-xs text-slate mt-1">
                    Enter your educational history including School Examinations (O/L, A/L) and any Diplomas or Certifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQualification}
                  className="rounded-lg border border-navy bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-gold hover:text-navy transition self-start sm:self-auto"
                >
                  + Add Another Qualification
                </button>
              </div>

              {qualifications.map((qual, qIdx) => (
                <div key={qual.id || qIdx} className="rounded-xl border border-slate/20 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate/15">
                    <span className="font-bold text-navy text-sm uppercase tracking-wider">
                      Qualification #{qIdx + 1}
                    </span>
                    {qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQualification(qual.id)}
                        className="text-xs font-bold text-error hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Qualification Type *</label>
                      <select
                        className={inputClass}
                        value={qual.qualificationType}
                        onChange={(e) => updateQualificationField(qual.id, "qualificationType", e.target.value)}
                      >
                        <option value="GCE O/L">GCE Ordinary Level (O/L)</option>
                        <option value="GCE A/L">GCE Advanced Level (A/L)</option>
                        <option value="Edexcel / Cambridge">Edexcel / Cambridge</option>
                        <option value="Diploma / HND">Diploma / HND</option>
                        <option value="Degree">Bachelors Degree</option>
                        <option value="Certificate / Other">Professional Certificate / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">School / Institution Name *</label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        value={qual.institution}
                        onChange={(e) => updateQualificationField(qual.id, "institution", e.target.value)}
                        placeholder="e.g. Trinity College / Royal College"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Year Completed *</label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        value={qual.yearCompleted}
                        onChange={(e) => updateQualificationField(qual.id, "yearCompleted", e.target.value)}
                        placeholder="2023"
                      />
                    </div>
                  </div>

                  {/* Subject & Grades Dynamic Table */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">Subjects & Grades</span>
                      <button
                        type="button"
                        onClick={() => addSubjectRow(qual.id)}
                        className="text-xs font-bold text-brand-red hover:underline"
                      >
                        + Add Subject
                      </button>
                    </div>

                    <div className="space-y-2">
                      {qual.subjectsAndGrades.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            className={inputClass}
                            value={sub.subject}
                            onChange={(e) => updateSubjectRow(qual.id, sIdx, "subject", e.target.value)}
                            placeholder="Subject (e.g. Mathematics)"
                          />
                          <input
                            type="text"
                            className="w-24 rounded-lg border border-slate/30 bg-white px-3 py-2.5 text-center text-sm font-bold text-navy uppercase focus:border-gold focus:outline-none"
                            value={sub.grade}
                            onChange={(e) => updateSubjectRow(qual.id, sIdx, "grade", e.target.value)}
                            placeholder="Grade"
                          />
                          {qual.subjectsAndGrades.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubjectRow(qual.id, sIdx)}
                              className="p-2 text-slate hover:text-error text-sm font-bold"
                              title="Remove subject"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: PROGRAMME SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Step 3 — Programme & Intake Selection</h2>
                <p className="text-xs text-slate mt-1">
                  Select your desired academic programme, study stream, intake, and preferred branch campus.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Choose Study Programme *</label>
                  <select
                    className={inputClass}
                    value={programmeChoice.programmeId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedProg = programmesList.find((p) => p.id === selectedId);
                      if (selectedProg) {
                        setProgrammeChoice({
                          ...programmeChoice,
                          programmeId: selectedProg.id,
                          programmeTitle: selectedProg.title,
                          programmeSlug: selectedProg.slug,
                          level: selectedProg.level,
                        });
                      }
                    }}
                  >
                    <option value="">-- Select a Programme --</option>
                    {programmesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.level} · {p.mode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Preferred Intake *</label>
                  <select
                    className={inputClass}
                    value={programmeChoice.intake}
                    onChange={(e) => setProgrammeChoice({ ...programmeChoice, intake: e.target.value })}
                  >
                    <option value="2026 January Intake">2026 January Intake</option>
                    <option value="2026 April Intake">2026 April Intake</option>
                    <option value="2026 September Intake">2026 September Intake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Study Mode *</label>
                  <select
                    className={inputClass}
                    value={programmeChoice.studyMode}
                    onChange={(e) =>
                      setProgrammeChoice({
                        ...programmeChoice,
                        studyMode: e.target.value as ProgrammeChoice["studyMode"],
                      })
                    }
                  >
                    <option value="Hybrid">Hybrid (80% Online, 20% Direct)</option>
                    <option value="Online">100% Online</option>
                    <option value="Direct">Direct / On Campus</option>
                    <option value="Flexible">Flexible Weekend</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Branch / Campus Location *</label>
                  <select
                    className={inputClass}
                    value={programmeChoice.campus}
                    onChange={(e) => setProgrammeChoice({ ...programmeChoice, campus: e.target.value })}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b} Campus / Study Centre
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {programmeChoice.programmeTitle && (
                <div className="rounded-xl bg-ice p-5 border border-gold/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Selected Selection Summary</span>
                  <h3 className="font-bold text-navy text-lg mt-0.5">{programmeChoice.programmeTitle}</h3>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate">
                    <div>Level: <strong className="text-navy">{programmeChoice.level}</strong></div>
                    <div>Intake: <strong className="text-navy">{programmeChoice.intake}</strong></div>
                    <div>Mode: <strong className="text-navy">{programmeChoice.studyMode}</strong></div>
                    <div>Campus: <strong className="text-navy">{programmeChoice.campus}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: DOCUMENTS UPLOAD */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Step 4 — Upload Supporting Documents</h2>
                <p className="text-xs text-slate mt-1">
                  Upload scanned copies or clear photos of your credentials. PDF, JPG, PNG, and WebP (up to 5MB per file) are supported.
                </p>
              </div>

              <DocumentUploader
                documents={documents}
                onDocumentsChange={(updatedDocs) => setDocuments(updatedDocs)}
              />
            </div>
          )}

          {/* STEP 5: REVIEW & DECLARATION */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-navy">Step 5 — Application Review & Submission</h2>
                <p className="text-xs text-slate mt-1">
                  Please thoroughly review your details before confirming your declaration and submitting your application.
                </p>
              </div>

              {/* Personal Info Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">1. Personal Information</h3>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit Details →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>Full Name: <strong className="text-navy">{personalInfo.title} {personalInfo.fullName}</strong></div>
                  <div>NIC / Passport: <strong className="text-navy">{personalInfo.nicOrPassport}</strong></div>
                  <div>Email: <strong className="text-navy">{personalInfo.email}</strong></div>
                  <div>Phone: <strong className="text-navy">{personalInfo.phone}</strong></div>
                  <div>Date of Birth: <strong className="text-navy">{personalInfo.dateOfBirth}</strong> ({personalInfo.gender})</div>
                  <div>Address: <strong className="text-navy">{personalInfo.addressLine1}, {personalInfo.city}</strong></div>
                  <div>Emergency Contact: <strong className="text-navy">{personalInfo.emergencyContactName} ({personalInfo.emergencyContactPhone})</strong></div>
                </div>
              </div>

              {/* Qualifications Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">2. Academic History</h3>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit Qualifications →
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {qualifications.map((q, idx) => (
                    <div key={idx} className="rounded bg-ice p-3 border border-slate/10">
                      <div className="flex justify-between font-bold text-navy">
                        <span>{q.qualificationType} — {q.institution}</span>
                        <span>{q.yearCompleted}</span>
                      </div>
                      {q.subjectsAndGrades?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {q.subjectsAndGrades.map((sub, sIdx) => (
                            <span key={sIdx} className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] border border-slate/15">
                              {sub.subject}: {sub.grade}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Programme Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">3. Programme Choice</h3>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit Programme →
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-sm font-bold text-navy">{programmeChoice.programmeTitle}</div>
                  <div className="text-slate">Level: <strong className="text-navy">{programmeChoice.level}</strong> · Intake: <strong className="text-navy">{programmeChoice.intake}</strong></div>
                  <div className="text-slate">Mode: <strong className="text-navy">{programmeChoice.studyMode}</strong> · Campus: <strong className="text-navy">{programmeChoice.campus}</strong></div>
                </div>
              </div>

              {/* Documents Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">4. Uploaded Credentials ({documents.length})</h3>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit Documents →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {documents.map((d) => (
                    <span key={d.id} className="rounded-lg bg-ice px-2.5 py-1 text-charcoal border border-slate/15">
                      📄 {d.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="rounded-xl border-2 border-gold/40 bg-gold/5 p-6 space-y-4">
                <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Applicant Declaration</h3>
                <label className="flex items-start gap-3 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-gold shrink-0"
                  />
                  <span className="leading-relaxed">
                    I hereby declare that all information provided in this application is complete, authentic, and accurate. I understand that any false declaration or submission of fraudulent documents may lead to the cancellation of my admission at Nextway College International. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS / BUTTON BAR */}
          <div className="mt-8 pt-6 border-t border-slate/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={saving || submitting}>
                  ← Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => saveDraft()}
                disabled={saving || submitting}
                className="w-full sm:w-auto rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal hover:bg-ice transition"
              >
                {saving ? "Saving Draft..." : "Save Draft & Exit"}
              </button>

              {currentStep < 5 ? (
                <Button type="button" variant="primary" onClick={handleNextStep} disabled={saving} className="w-full sm:w-auto">
                  Save & Continue →
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleFinalSubmit}
                  disabled={submitting || !declarationConfirmed}
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Submitting Application..." : "Submit Application ✓"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
