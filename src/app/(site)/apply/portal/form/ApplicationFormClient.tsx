"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApplicationStepper } from "@/components/applicant/ApplicationStepper";
import { DocumentUploader } from "@/components/applicant/DocumentUploader";
import { Button } from "@/components/ui/Button";
import type {
  AcademicQualification,
  PersonalInformation,
  PresentOccupationEntry,
  ProfessionalQualification,
  ProgrammeChoice,
  StudentApplication,
  UploadedDocument,
} from "@/types/admissions";
import type { Programme } from "@/types";
import { BRANCHES } from "@/constants/site";
import { readRememberedProgrammeSlug, clearRememberedProgrammeSlug } from "@/lib/applicant-programme";
import { apiFetch } from "@/lib/api-fetch";

const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Divorced", "Separated"];

function emptyOlQual(): AcademicQualification {
  return {
    id: "ol",
    qualificationType: "GCE O/L",
    yearCompleted: "",
    indexOrRegNumber: "",
    subjectsAndGrades: [{ subject: "", grade: "" }],
  };
}

function emptyAlQual(): AcademicQualification {
  return {
    id: "al",
    qualificationType: "GCE A/L",
    yearCompleted: "",
    indexOrRegNumber: "",
    subjectsAndGrades: [{ subject: "", grade: "" }],
  };
}

export function ApplicationFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const uid = useId();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const [appNumber, setAppNumber] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Available programmes from DB
  const [programmesList, setProgrammesList] = useState<Programme[]>([]);

  // Step 2: Personal Particulars (form items 01–05)
  const [personalInfo, setPersonalInfo] = useState<PersonalInformation>({
    title: "Mr",
    fullName: "",
    nameWithInitials: "",
    dateOfBirth: "",
    civilStatus: "",
    nicOrPassport: "",
    email: "",
    phone: "",
    homeTelephone: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
    contactAddress: "",
  });

  // Step 3: Qualifications & Background (form items 07–10a)
  const [olQual, setOlQual] = useState<AcademicQualification>(emptyOlQual());
  const [alQual, setAlQual] = useState<AcademicQualification>(emptyAlQual());
  const [professionalQualifications, setProfessionalQualifications] = useState<ProfessionalQualification[]>([]);
  const [presentOccupation, setPresentOccupation] = useState<PresentOccupationEntry[]>([]);

  // Step 1: Course Applied For (programme, intake, mode, campus)
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

  // Step 5: Declaration & Signature
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [signatureName, setSignatureName] = useState("");

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        // The application and the programme list don't depend on each
        // other — fetch both in parallel rather than paying two sequential
        // round trips before the form can render on a 4G connection.
        const [appRes, progRes] = await Promise.all([
          apiFetch("/api/applicant/application"),
          apiFetch("/api/programmes"),
        ]);

        if (appRes.status === 401) {
          router.push("/apply/login");
          return;
        }

        const appData = await appRes.json();
        if (appRes.ok && appData.ok && appData.application) {
          const a: StudentApplication = appData.application;
          setAppNumber(a.applicationNumber);
          if (a.personalInfo) setPersonalInfo((prev) => ({ ...prev, ...a.personalInfo }));
          if (a.qualifications?.length) {
            const foundOl = a.qualifications.find((q) => q.qualificationType === "GCE O/L");
            const foundAl = a.qualifications.find((q) => q.qualificationType === "GCE A/L");
            if (foundOl) setOlQual(foundOl);
            if (foundAl) setAlQual(foundAl);
          }
          if (a.professionalQualifications?.length) setProfessionalQualifications(a.professionalQualifications);
          if (a.presentOccupation?.length) setPresentOccupation(a.presentOccupation);
          if (a.programmeChoice?.programmeId) setProgrammeChoice(a.programmeChoice);
          if (a.documents) setDocuments(a.documents);
          if (a.declarationConfirmed) setDeclarationConfirmed(a.declarationConfirmed);
          if (a.signatureName) setSignatureName(a.signatureName);

          const stepParam = searchParams.get("step");
          if (stepParam) {
            const stepNum = parseInt(stepParam, 10);
            if (stepNum >= 1 && stepNum <= 5) setCurrentStep(stepNum);
          } else if (a.currentStep) {
            setCurrentStep(a.currentStep);
          }
        }

        if (progRes.ok) {
          const progData = await progRes.json();
          // /api/programmes already only returns published programmes.
          if (Array.isArray(progData)) {
            setProgrammesList(progData);
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

  // Handle a preselected programme from an explicit ?programme= query param
  // or whatever /apply, register or verify remembered in sessionStorage
  // earlier in this flow. Either way, this only fills in a choice that
  // hasn't been made yet — a stale bookmarked link (e.g. an old verify
  // email) must never silently overwrite an application already mid-progress
  // with a different programme. Switching programmes deliberately is Step
  // 1's job, not a side effect of the URL.
  useEffect(() => {
    if (programmesList.length === 0) return;
    if (programmeChoice.programmeId) return;

    const explicitSlug = searchParams.get("programme");
    const slug = explicitSlug || readRememberedProgrammeSlug();
    if (!slug) return;

    const found = programmesList.find((p) => p.slug === slug);
    if (!found) {
      clearRememberedProgrammeSlug();
      return;
    }

    const nextChoice: ProgrammeChoice = {
      ...programmeChoice,
      programmeId: found.id,
      programmeTitle: found.title,
      programmeSlug: found.slug,
      level: found.level,
    };
    setProgrammeChoice(nextChoice);
    clearRememberedProgrammeSlug();
    // Persist immediately so the choice survives even if the applicant
    // leaves before reaching the programme step or clicking Save.
    void saveDraft(undefined, nextChoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, programmesList]);

  // Strips fully-blank subject/grade rows before they're sent to the
  // server — the UI always keeps at least one editable row present, even
  // if the applicant never filled it in.
  function cleanQual(q: AcademicQualification): AcademicQualification {
    return {
      ...q,
      subjectsAndGrades: q.subjectsAndGrades.filter((s) => s.subject.trim() || s.grade.trim()),
    };
  }

  // Save Draft Helper
  async function saveDraft(targetStep?: number, overrideProgrammeChoice?: ProgrammeChoice): Promise<boolean> {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/applicant/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: targetStep || currentStep,
          personalInfo,
          qualifications: [cleanQual(olQual), cleanQual(alQual)],
          professionalQualifications,
          presentOccupation,
          programmeChoice: overrideProgrammeChoice || programmeChoice,
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

    // Validate Step 1 — Course Applied For
    if (currentStep === 1) {
      if (!programmeChoice.programmeId || !programmeChoice.programmeTitle) {
        setErrorMsg("Please select the course you are applying for.");
        return;
      }
      if (!programmeChoice.intake) {
        setErrorMsg("Please select your preferred intake.");
        return;
      }
    }

    // Validate Step 2 — Personal Particulars
    if (currentStep === 2) {
      if (!personalInfo.fullName.trim()) {
        setErrorMsg("Please enter your name in full (01a).");
        return;
      }
      if (!personalInfo.nameWithInitials.trim()) {
        setErrorMsg("Please enter your name with initials (01b).");
        return;
      }
      if (!personalInfo.addressLine1.trim() || !personalInfo.city.trim()) {
        setErrorMsg("Please enter your permanent address (02a).");
        return;
      }
      if (!personalInfo.phone.trim()) {
        setErrorMsg("Please enter a mobile contact number (02c).");
        return;
      }
      if (!personalInfo.nicOrPassport.trim()) {
        setErrorMsg("Please enter your National Identity Card No. (03).");
        return;
      }
      if (!personalInfo.dateOfBirth) {
        setErrorMsg("Please enter your date of birth (04a).");
        return;
      }
      if (!personalInfo.civilStatus.trim()) {
        setErrorMsg("Please select your civil status (05).");
        return;
      }
    }

    // Validate Step 3 — Qualifications & Background
    if (currentStep === 3) {
      const olHasSubjects = olQual.subjectsAndGrades.some((s) => s.subject.trim() && s.grade.trim());
      if (!olQual.yearCompleted?.trim() || !olHasSubjects) {
        setErrorMsg("Please provide your G.C.E. (O/L) year and at least one subject/grade (07).");
        return;
      }
    }

    // Validate Step 4 — Documents
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
    if (!signatureName.trim()) {
      setErrorMsg("Please type your full name as your signature.");
      return;
    }
    if (!declarationConfirmed) {
      setErrorMsg("You must confirm the declaration to submit your application.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await apiFetch("/api/applicant/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo,
          qualifications: [cleanQual(olQual), cleanQual(alQual)],
          professionalQualifications,
          presentOccupation,
          programmeChoice,
          signatureName,
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

  /* ---------------- O/L & A/L Subject Row Modifiers ---------------- */
  function addSubjectRow(setter: React.Dispatch<React.SetStateAction<AcademicQualification>>) {
    setter((prev) => ({ ...prev, subjectsAndGrades: [...prev.subjectsAndGrades, { subject: "", grade: "" }] }));
  }

  function updateSubjectRow(
    setter: React.Dispatch<React.SetStateAction<AcademicQualification>>,
    idx: number,
    field: "subject" | "grade",
    val: string,
  ) {
    setter((prev) => {
      const copy = [...prev.subjectsAndGrades];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, subjectsAndGrades: copy };
    });
  }

  function removeSubjectRow(setter: React.Dispatch<React.SetStateAction<AcademicQualification>>, idx: number) {
    setter((prev) => ({ ...prev, subjectsAndGrades: prev.subjectsAndGrades.filter((_, i) => i !== idx) }));
  }

  /* ---------------- Professional Qualification Modifiers ---------------- */
  function addProfessionalQualification() {
    setProfessionalQualifications((prev) => [
      ...prev,
      { id: "prof_" + Date.now(), institution: "", qualificationObtained: "", dateOfCommencement: "", effectiveDate: "", duration: "" },
    ]);
  }

  function removeProfessionalQualification(id: string) {
    setProfessionalQualifications((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProfessionalQualification<K extends keyof ProfessionalQualification>(
    id: string,
    field: K,
    value: ProfessionalQualification[K],
  ) {
    setProfessionalQualifications((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  /* ---------------- Present Occupation Modifiers ---------------- */
  function addPresentOccupation() {
    setPresentOccupation((prev) => [
      ...prev,
      { id: "occ_" + Date.now(), occupation: "", institute: "", from: "", to: "", numberOfMonths: "", lastSalaryDrawn: "" },
    ]);
  }

  function removePresentOccupation(id: string) {
    setPresentOccupation((prev) => prev.filter((o) => o.id !== id));
  }

  function updatePresentOccupation<K extends keyof PresentOccupationEntry>(
    id: string,
    field: K,
    value: PresentOccupationEntry[K],
  ) {
    setPresentOccupation((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
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

  // Renders one O/L or A/L subjects-and-grades table, shared by the two
  // fixed sections (form items 07 and 08 don't allow adding/removing whole
  // qualifications — only the subject rows within each are dynamic).
  function renderSubjectsTable(
    qual: AcademicQualification,
    setter: React.Dispatch<React.SetStateAction<AcademicQualification>>,
  ) {
    return (
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-navy">Subject &amp; Grade</span>
          <button type="button" onClick={() => addSubjectRow(setter)} className="text-xs font-bold text-brand-red hover:underline">
            + Add Subject
          </button>
        </div>
        <div className="space-y-2">
          {qual.subjectsAndGrades.map((sub, sIdx) => (
            <div key={sIdx} className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Subject ${sIdx + 1}`}
                className={inputClass}
                value={sub.subject}
                onChange={(e) => updateSubjectRow(setter, sIdx, "subject", e.target.value)}
                placeholder="Subject"
              />
              <input
                type="text"
                aria-label={`Grade for subject ${sIdx + 1}`}
                className="w-24 rounded-lg border border-slate/30 bg-white px-3 py-2.5 text-center text-sm font-bold text-navy uppercase focus:border-gold focus:outline-none"
                value={sub.grade}
                onChange={(e) => updateSubjectRow(setter, sIdx, "grade", e.target.value)}
                placeholder="Grade"
              />
              {qual.subjectsAndGrades.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubjectRow(setter, sIdx)}
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
    );
  }

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
          {/* STEP 1: COURSE APPLIED FOR */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Course Applied For</h2>
                <p className="text-xs text-slate mt-1">
                  Select the programme, intake, study mode and campus you are applying for.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-programmeId`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Course Applied For *</label>
                  <select
                    id={`${uid}-programmeId`}
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
                    <option value="">-- Select a Course --</option>
                    {programmesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.level} · {p.mode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`${uid}-intake`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Preferred Intake *</label>
                  <select
                    id={`${uid}-intake`}
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
                  <label htmlFor={`${uid}-studyMode`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Study Mode *</label>
                  <select
                    id={`${uid}-studyMode`}
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
                  <label htmlFor={`${uid}-campus`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Branch / Campus Location *</label>
                  <select
                    id={`${uid}-campus`}
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-text">Selected Course</span>
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

          {/* STEP 2: PERSONAL PARTICULARS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Personal Particulars</h2>
                <p className="text-xs text-slate mt-1">
                  Items 01–05 of the Form of Application. Please enter these exactly as shown on your NIC or passport.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label htmlFor={`${uid}-title`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Title</label>
                  <select
                    id={`${uid}-title`}
                    className={inputClass}
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor={`${uid}-fullName`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">01. (a) Name in Full — underline the Surname *</label>
                  <input
                    id={`${uid}-fullName`}
                    type="text"
                    required
                    className={inputClass}
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    placeholder="e.g. Johnathan Alexander PERERA"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor={`${uid}-nameWithInitials`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">(b) Name with Initials *</label>
                  <input
                    id={`${uid}-nameWithInitials`}
                    type="text"
                    required
                    className={inputClass}
                    value={personalInfo.nameWithInitials}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nameWithInitials: e.target.value })}
                    placeholder="e.g. J. A. Perera"
                  />
                </div>
              </div>

              <div className="border-t border-slate/15 pt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-addressLine1`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">02. (a) Permanent Address *</label>
                    <input
                      id={`${uid}-addressLine1`}
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.addressLine1}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, addressLine1: e.target.value })}
                      placeholder="Street address / House No"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-city`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">City / Town *</label>
                    <input
                      id={`${uid}-city`}
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                      placeholder="Kandy"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-postalCode`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Postal Code</label>
                    <input
                      id={`${uid}-postalCode`}
                      type="text"
                      className={inputClass}
                      value={personalInfo.postalCode || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                      placeholder="20800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`${uid}-contactAddress`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">(b) Contact Address (if different from permanent address)</label>
                    <input
                      id={`${uid}-contactAddress`}
                      type="text"
                      className={inputClass}
                      value={personalInfo.contactAddress || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, contactAddress: e.target.value })}
                      placeholder="Leave blank if same as permanent address"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate/15 pt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-homeTelephone`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">(c) Contact Telephone No. — Home</label>
                    <input
                      id={`${uid}-homeTelephone`}
                      type="tel"
                      className={inputClass}
                      value={personalInfo.homeTelephone || ""}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, homeTelephone: e.target.value })}
                      placeholder="0812201650"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-phone`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Mobile *</label>
                    <input
                      id={`${uid}-phone`}
                      type="tel"
                      required
                      className={inputClass}
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="+94 7X XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate/15 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={`${uid}-nicOrPassport`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">03. National Identity Card No. *</label>
                    <input
                      id={`${uid}-nicOrPassport`}
                      type="text"
                      required
                      className={inputClass}
                      value={personalInfo.nicOrPassport}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, nicOrPassport: e.target.value })}
                      placeholder="200012345678 or N1234567"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-dateOfBirth`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">04. (a) Date of Birth *</label>
                    <input
                      id={`${uid}-dateOfBirth`}
                      type="date"
                      required
                      className={inputClass}
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-civilStatus`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">05. Civil Status *</label>
                    <select
                      id={`${uid}-civilStatus`}
                      className={inputClass}
                      value={personalInfo.civilStatus}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, civilStatus: e.target.value })}
                    >
                      <option value="">-- Select --</option>
                      {CIVIL_STATUS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUALIFICATIONS & BACKGROUND */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-navy">Qualifications &amp; Background</h2>
                <p className="text-xs text-slate mt-1">
                  Items 07–10 of the Form of Application. Certified copies of certificates should be attached in the Documents step.
                </p>
              </div>

              {/* 07. G.C.E. (O/L) */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-4 shadow-sm">
                <div className="pb-3 border-b border-slate/15">
                  <span className="font-bold text-navy text-sm uppercase tracking-wider">07. G.C.E. (O/L)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-olYear`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Year *</label>
                    <input
                      id={`${uid}-olYear`}
                      type="text"
                      className={inputClass}
                      value={olQual.yearCompleted}
                      onChange={(e) => setOlQual({ ...olQual, yearCompleted: e.target.value })}
                      placeholder="2019"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-olIndex`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Index No</label>
                    <input
                      id={`${uid}-olIndex`}
                      type="text"
                      className={inputClass}
                      value={olQual.indexOrRegNumber || ""}
                      onChange={(e) => setOlQual({ ...olQual, indexOrRegNumber: e.target.value })}
                    />
                  </div>
                </div>
                {renderSubjectsTable(olQual, setOlQual)}
              </div>

              {/* 08. G.C.E. (A/L) */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-4 shadow-sm">
                <div className="pb-3 border-b border-slate/15">
                  <span className="font-bold text-navy text-sm uppercase tracking-wider">08. G.C.E. (A/L)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-alYear`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Year</label>
                    <input
                      id={`${uid}-alYear`}
                      type="text"
                      className={inputClass}
                      value={alQual.yearCompleted}
                      onChange={(e) => setAlQual({ ...alQual, yearCompleted: e.target.value })}
                      placeholder="2021"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-alIndex`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Index No</label>
                    <input
                      id={`${uid}-alIndex`}
                      type="text"
                      className={inputClass}
                      value={alQual.indexOrRegNumber || ""}
                      onChange={(e) => setAlQual({ ...alQual, indexOrRegNumber: e.target.value })}
                    />
                  </div>
                </div>
                {renderSubjectsTable(alQual, setAlQual)}
              </div>

              {/* 09. Professional Qualifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-sm uppercase tracking-wider">09. Professional Qualifications (if any)</span>
                  <button
                    type="button"
                    onClick={addProfessionalQualification}
                    className="rounded-lg border border-navy bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-gold hover:text-navy transition"
                  >
                    + Add
                  </button>
                </div>
                {professionalQualifications.length === 0 && (
                  <p className="text-xs text-slate italic">Not applicable — leave blank if none.</p>
                )}
                {professionalQualifications.map((p, idx) => (
                  <div key={p.id} className="rounded-xl border border-slate/20 bg-white p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy uppercase tracking-wider">Entry #{idx + 1}</span>
                      <button type="button" onClick={() => removeProfessionalQualification(p.id)} className="text-xs font-bold text-error hover:underline">
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        aria-label="Institution"
                        className={inputClass}
                        value={p.institution}
                        onChange={(e) => updateProfessionalQualification(p.id, "institution", e.target.value)}
                        placeholder="Institution"
                      />
                      <input
                        type="text"
                        aria-label="Qualifications Obtained"
                        className={inputClass}
                        value={p.qualificationObtained}
                        onChange={(e) => updateProfessionalQualification(p.id, "qualificationObtained", e.target.value)}
                        placeholder="Qualification Obtained"
                      />
                      <input
                        type="text"
                        aria-label="Date of Commencement"
                        className={inputClass}
                        value={p.dateOfCommencement || ""}
                        onChange={(e) => updateProfessionalQualification(p.id, "dateOfCommencement", e.target.value)}
                        placeholder="Date of Commencement"
                      />
                      <input
                        type="text"
                        aria-label="Effective Date"
                        className={inputClass}
                        value={p.effectiveDate || ""}
                        onChange={(e) => updateProfessionalQualification(p.id, "effectiveDate", e.target.value)}
                        placeholder="Effective Date"
                      />
                      <input
                        type="text"
                        aria-label="Duration"
                        className={inputClass}
                        value={p.duration || ""}
                        onChange={(e) => updateProfessionalQualification(p.id, "duration", e.target.value)}
                        placeholder="Duration"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 10(a). Present Occupation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-sm uppercase tracking-wider">10. (a) Present Occupation (if any)</span>
                  <button
                    type="button"
                    onClick={addPresentOccupation}
                    className="rounded-lg border border-navy bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-gold hover:text-navy transition"
                  >
                    + Add
                  </button>
                </div>
                {presentOccupation.length === 0 && (
                  <p className="text-xs text-slate italic">Not applicable — leave blank if none.</p>
                )}
                {presentOccupation.map((o, idx) => (
                  <div key={o.id} className="rounded-xl border border-slate/20 bg-white p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy uppercase tracking-wider">Entry #{idx + 1}</span>
                      <button type="button" onClick={() => removePresentOccupation(o.id)} className="text-xs font-bold text-error hover:underline">
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        aria-label="Occupation"
                        className={inputClass}
                        value={o.occupation}
                        onChange={(e) => updatePresentOccupation(o.id, "occupation", e.target.value)}
                        placeholder="Occupation"
                      />
                      <input
                        type="text"
                        aria-label="Institute"
                        className={inputClass}
                        value={o.institute}
                        onChange={(e) => updatePresentOccupation(o.id, "institute", e.target.value)}
                        placeholder="Institute"
                      />
                      <input
                        type="text"
                        aria-label="From"
                        className={inputClass}
                        value={o.from || ""}
                        onChange={(e) => updatePresentOccupation(o.id, "from", e.target.value)}
                        placeholder="From"
                      />
                      <input
                        type="text"
                        aria-label="To"
                        className={inputClass}
                        value={o.to || ""}
                        onChange={(e) => updatePresentOccupation(o.id, "to", e.target.value)}
                        placeholder="To"
                      />
                      <input
                        type="text"
                        aria-label="Number of months"
                        className={inputClass}
                        value={o.numberOfMonths || ""}
                        onChange={(e) => updatePresentOccupation(o.id, "numberOfMonths", e.target.value)}
                        placeholder="Number of months"
                      />
                      <input
                        type="text"
                        aria-label="Last salary drawn"
                        className={inputClass}
                        value={o.lastSalaryDrawn || ""}
                        onChange={(e) => updatePresentOccupation(o.id, "lastSalaryDrawn", e.target.value)}
                        placeholder="Last salary drawn"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENTS UPLOAD */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy">Upload Supporting Documents</h2>
                <p className="text-xs text-slate mt-1">
                  Certified copies of certificates should be attached (item 07), along with your NIC/passport and a passport-size photo. PDF, JPG, PNG, and WebP (up to 5MB per file) are supported.
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
                <h2 className="text-xl font-bold text-navy">Review, Declaration &amp; Signature</h2>
                <p className="text-xs text-slate mt-1">
                  Please thoroughly review your details before signing the declaration and submitting your application.
                </p>
              </div>

              {/* Course Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Course Applied For</h3>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-sm font-bold text-navy">{programmeChoice.programmeTitle}</div>
                  <div className="text-slate">Level: <strong className="text-navy">{programmeChoice.level}</strong> · Intake: <strong className="text-navy">{programmeChoice.intake}</strong></div>
                  <div className="text-slate">Mode: <strong className="text-navy">{programmeChoice.studyMode}</strong> · Campus: <strong className="text-navy">{programmeChoice.campus}</strong></div>
                </div>
              </div>

              {/* Personal Info Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Personal Particulars</h3>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>01(a) Name in Full: <strong className="text-navy">{personalInfo.title} {personalInfo.fullName}</strong></div>
                  <div>01(b) Name with Initials: <strong className="text-navy">{personalInfo.nameWithInitials}</strong></div>
                  <div>02(a) Permanent Address: <strong className="text-navy">{[personalInfo.addressLine1, personalInfo.city, personalInfo.postalCode].filter(Boolean).join(", ")}</strong></div>
                  <div>02(b) Contact Address: <strong className="text-navy">{personalInfo.contactAddress || "—"}</strong></div>
                  <div>02(c) Telephone: <strong className="text-navy">Home {personalInfo.homeTelephone || "—"} · Mobile {personalInfo.phone}</strong></div>
                  <div>03. NIC No: <strong className="text-navy">{personalInfo.nicOrPassport}</strong></div>
                  <div>04(a) Date of Birth: <strong className="text-navy">{personalInfo.dateOfBirth}</strong></div>
                  <div>05. Civil Status: <strong className="text-navy">{personalInfo.civilStatus}</strong></div>
                </div>
              </div>

              {/* Qualifications Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Qualifications &amp; Background</h3>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {[olQual, alQual].map((q) => (
                    <div key={q.id} className="rounded bg-ice p-3 border border-slate/10">
                      <div className="flex justify-between font-bold text-navy">
                        <span>{q.qualificationType === "GCE O/L" ? "07. G.C.E. (O/L)" : "08. G.C.E. (A/L)"}</span>
                        <span>{q.yearCompleted || "—"}</span>
                      </div>
                      {q.subjectsAndGrades?.filter((s) => s.subject || s.grade).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {q.subjectsAndGrades.filter((s) => s.subject || s.grade).map((sub, sIdx) => (
                            <span key={sIdx} className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] border border-slate/15">
                              {sub.subject}: {sub.grade}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {professionalQualifications.length > 0 && (
                    <div className="rounded bg-ice p-3 border border-slate/10">
                      <div className="font-bold text-navy mb-1">09. Professional Qualifications</div>
                      {professionalQualifications.map((p) => (
                        <div key={p.id} className="text-slate">{p.institution} — {p.qualificationObtained}</div>
                      ))}
                    </div>
                  )}
                  {presentOccupation.length > 0 && (
                    <div className="rounded bg-ice p-3 border border-slate/10">
                      <div className="font-bold text-navy mb-1">10(a). Present Occupation</div>
                      {presentOccupation.map((o) => (
                        <div key={o.id} className="text-slate">{o.occupation} — {o.institute}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Review Card */}
              <div className="rounded-xl border border-slate/20 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate/15">
                  <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Uploaded Credentials ({documents.length})</h3>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
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

              {/* Declaration & Signature */}
              <div className="rounded-xl border-2 border-gold/40 bg-gold/5 p-6 space-y-5">
                <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Applicant Declaration</h3>
                <p className="text-xs text-charcoal leading-relaxed">
                  I do hereby certify that particulars submitted by me in this application are true and accurate. I am aware that if any of these particulars are found to be false or inaccurate, I am liable to be disqualified before Final Examination.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-signatureName`} className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Signature of Applicant — type your full name *</label>
                    <input
                      id={`${uid}-signatureName`}
                      type="text"
                      required
                      className={inputClass}
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder={personalInfo.fullName || "Full legal name"}
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Date</span>
                    <div className={inputClass + " bg-ice/60"}>
                      {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-gold shrink-0"
                  />
                  <span className="leading-relaxed">
                    I confirm the declaration above and that the typed signature is my own. *
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
