"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { StudentApplication } from "@/types/admissions";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api-fetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPaperPlane,
  faMagnifyingGlass,
  faTriangleExclamation,
  faFileCircleCheck,
  faCalendarCheck,
  faCircleCheck,
  faGraduationCap,
  faCircleXmark,
  faHourglassHalf,
  faCircleInfo,
  faPrint,
  faPhone,
  faEnvelope,
  faFileArrowUp,
  faTrashCan,
  faNoteSticky,
  faClock,
  faClockRotateLeft,
  faArrowLeft,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

type BadgeVariant = "default" | "gold" | "navy" | "brand-red" | "success" | "slate";

const STATUS_META: Record<string, { label: string; variant: BadgeVariant; icon: IconDefinition }> = {
  DRAFT: { label: "Draft (In Progress)", variant: "slate", icon: faPenToSquare },
  SUBMITTED: { label: "Submitted", variant: "navy", icon: faPaperPlane },
  UNDER_REVIEW: { label: "Under Review", variant: "gold", icon: faMagnifyingGlass },
  DOCUMENTS_REQUIRED: { label: "Action: Documents Required", variant: "brand-red", icon: faTriangleExclamation },
  DOCUMENTS_VERIFICATION: { label: "Verifying Documents", variant: "gold", icon: faFileCircleCheck },
  INTERVIEW_REQUIRED: { label: "Interview Scheduled", variant: "navy", icon: faCalendarCheck },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", variant: "navy", icon: faCalendarCheck },
  APPROVED: { label: "Offer Approved", variant: "gold", icon: faCircleCheck },
  ENROLLED: { label: "Enrolled", variant: "gold", icon: faGraduationCap },
  REJECTED: { label: "Not Successful", variant: "brand-red", icon: faCircleXmark },
  WAITLISTED: { label: "Waitlisted", variant: "slate", icon: faHourglassHalf },
};

function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status.replace(/_/g, " "), variant: "default" as BadgeVariant, icon: faCircleInfo };
}

function timelineIcon(action: string): IconDefinition {
  if (action.startsWith("Status changed to")) return statusMeta(action.replace("Status changed to ", "").trim().replace(/ /g, "_")).icon;
  if (action === "Application submitted") return faPaperPlane;
  if (action === "Document uploaded") return faFileArrowUp;
  if (action === "Document removed") return faTrashCan;
  if (action.startsWith("Document verified")) return faCircleCheck;
  if (action.startsWith("Document rejected")) return faCircleXmark;
  if (action.startsWith("Document pending")) return faClock;
  if (action === "Interview scheduled") return faCalendarCheck;
  if (action === "Additional documents requested") return faTriangleExclamation;
  if (action === "Staff note added") return faNoteSticky;
  return faCircleInfo;
}

function getStatusBadge(status: string) {
  const meta = statusMeta(status);
  return (
    <Badge variant={meta.variant}>
      <span className="inline-flex items-center gap-1.5">
        <FontAwesomeIcon icon={meta.icon} className="h-3 w-3" />
        {meta.label}
      </span>
    </Badge>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const [app, setApp] = useState<StudentApplication | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [currentRes, listRes] = await Promise.all([
          apiFetch("/api/applicant/application"),
          apiFetch("/api/applicant/applications"),
        ]);
        if (currentRes.status === 401) {
          router.push("/apply/login");
          return;
        }
        const data = await currentRes.json();
        if (!currentRes.ok || !data.ok) {
          setError(data.error || "Failed to load application data.");
        } else {
          setApp(data.application);
        }

        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.ok) setApplications(listData.applications);
        }
      } catch {
        setError("Network error while loading your portal.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await apiFetch("/api/applicant/auth/logout", { method: "POST" });
    router.push("/apply/login");
    router.refresh();
  }

  async function handleDownloadPdf() {
    const res = await apiFetch("/api/applicant/application/pdf");
    if (!res.ok) {
      setError("Unable to download your application PDF right now.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${app?.applicationNumber || "application"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-pearl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <p className="text-sm font-semibold text-navy">Loading Applicant Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-pearl">
        <div className="premium-card max-w-md p-8 text-center">
          <h2 className="text-lg font-bold text-navy mb-2">Notice</h2>
          <p className="text-sm text-slate mb-6">{error || "Application not found."}</p>
          <Button href="/apply/login" variant="primary">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // The applicant may have more than one application on file (e.g. a past
  // rejected/waitlisted attempt alongside their current one). `viewApp` is
  // whichever one is on screen; it defaults to the current application.
  const viewApp = (selectedId && applications.find((a) => a.id === selectedId)) || app;
  const isCurrent = viewApp.id === app.id;
  const previousApplications = applications.filter((a) => a.id !== app.id);

  // Calculate progress percentage
  const totalSlots = 5;
  let completedSteps = 0;
  if (viewApp.personalInfo?.fullName && viewApp.personalInfo?.nicOrPassport) completedSteps += 1;
  if (viewApp.qualifications?.length > 0) completedSteps += 1;
  if (viewApp.programmeChoice?.programmeId) completedSteps += 1;
  if (viewApp.documents?.length > 0) completedSteps += 1;
  if (viewApp.status !== "DRAFT") completedSteps += 1;
  const progressPercent = Math.round((completedSteps / totalSlots) * 100);

  // Status changes pulled out of the full activity timeline, so applicants can
  // see the progression of their own application status at a glance.
  const statusHistory = viewApp.timeline?.filter((ev) => ev.action.startsWith("Status changed to")) || [];

  return (
    <div className="bg-pearl min-h-screen py-10">
      <div className="container-nwc max-w-5xl space-y-8">
        {!isCurrent && (
          <div className="rounded-xl border border-navy/20 bg-ice p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-navy">
              Viewing a previous application ({viewApp.applicationNumber}) — read only.
            </span>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> Back to current application
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="premium-card p-6 sm:p-8 bg-white border border-slate/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate/15">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-text">Applicant Portal</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy mt-1">
                {viewApp.personalInfo?.fullName || "Prospective Student"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate">
                <span>Application ID: <strong className="text-navy font-mono">{viewApp.applicationNumber}</strong></span>
                <span>•</span>
                <span>Created: {formatDate(viewApp.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate mb-1">Status</span>
                {getStatusBadge(viewApp.status)}
              </div>
              {isCurrent && viewApp.status === "SUBMITTED" && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-navy hover:bg-gold hover:text-navy transition"
                >
                  Download PDF
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate/20 px-3 py-2 text-xs font-semibold text-slate hover:bg-ice hover:text-navy transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="pt-6">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-navy">Application Completion</span>
              <span className="text-gold-text font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-ice overflow-hidden border border-slate/15">
              <div
                className="h-full bg-gradient-to-r from-navy via-deep-blue to-gold transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Action Alerts */}
        {isCurrent && viewApp.status === "DOCUMENTS_REQUIRED" && (
          <div className="rounded-xl border border-brand-red/30 bg-brand-red/10 p-6 text-charcoal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-brand-red text-lg">Action Required: Additional Documents Requested</h3>
                <p className="text-sm mt-1 text-charcoal/90">
                  {viewApp.requestedDocumentsNotes || "Admissions requires updated credentials to complete evaluation."}
                </p>
              </div>
              <Button href="/apply/portal/form?step=4" variant="primary" size="sm" className="shrink-0">
                Upload Documents Now
              </Button>
            </div>
          </div>
        )}

        {viewApp.status === "INTERVIEW_SCHEDULED" && viewApp.interview && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-6 text-charcoal">
            <h3 className="font-bold text-navy text-lg">Interview Scheduled</h3>
            <p className="text-sm mt-1 text-slate">
              Please attend your scheduled admission interview:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs bg-white rounded-lg p-4 border border-gold/20">
              <div>
                <span className="text-slate block">Date & Time:</span>
                <strong className="text-navy text-sm font-semibold">
                  {formatDateTime(viewApp.interview.scheduledAt)}
                </strong>
              </div>
              <div>
                <span className="text-slate block">Location / Meeting Link:</span>
                <strong className="text-navy text-sm font-semibold">{viewApp.interview.venueOrLink}</strong>
              </div>
              {viewApp.interview.instructions && (
                <div className="sm:col-span-2 pt-2 border-t border-slate/10">
                  <span className="text-slate block">Special Instructions:</span>
                  <p className="text-charcoal mt-0.5">{viewApp.interview.instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewApp.status === "APPROVED" && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-charcoal">
            <h3 className="font-bold text-success text-xl flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
              Congratulations! Your Application has been Approved
            </h3>
            <p className="text-sm mt-2 leading-relaxed text-charcoal">
              We are delighted to offer you admission to <strong>{viewApp.programmeChoice?.programmeTitle}</strong> for the {viewApp.programmeChoice?.intake}. An official admission letter will be dispatched to your email address.
            </p>
          </div>
        )}

        {isCurrent && viewApp.status === "DRAFT" && (
          <div className="rounded-xl border border-navy/20 bg-ice p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-navy text-base">Your Application is in Draft State</h3>
              <p className="text-xs text-slate mt-1">
                Complete the remaining steps to submit your application for review by the Admissions board.
              </p>
            </div>
            <Button href="/apply/portal/form" variant="primary" className="shrink-0">
              Continue Application →
            </Button>
          </div>
        )}

        {/* Overview Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Programme Section */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy text-lg">Selected Programme</h3>
                {isCurrent && viewApp.status === "DRAFT" && (
                  <Link href="/apply/portal/form?step=3" className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </Link>
                )}
              </div>
              {viewApp.programmeChoice?.programmeTitle ? (
                <div className="rounded-xl bg-ice p-4 border border-slate/10 space-y-2 text-sm">
                  <div className="font-bold text-navy text-base">{viewApp.programmeChoice.programmeTitle}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate">
                    <div>Level: <strong className="text-navy">{viewApp.programmeChoice.level}</strong></div>
                    <div>Intake: <strong className="text-navy">{viewApp.programmeChoice.intake}</strong></div>
                    <div>Mode: <strong className="text-navy">{viewApp.programmeChoice.studyMode}</strong></div>
                    <div>Campus: <strong className="text-navy">{viewApp.programmeChoice.campus}</strong></div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate italic">No programme selected yet.</p>
              )}
            </div>

            {/* Academic Qualifications Section */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy text-lg">Academic Qualifications</h3>
                {isCurrent && viewApp.status === "DRAFT" && (
                  <Link href="/apply/portal/form?step=2" className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </Link>
                )}
              </div>
              {viewApp.qualifications?.length > 0 ? (
                <div className="space-y-3">
                  {viewApp.qualifications.map((q, idx) => (
                    <div key={q.id || idx} className="rounded-lg bg-ice p-3 text-xs border border-slate/10">
                      <div className="flex justify-between font-bold text-navy">
                        <span>{q.qualificationType}</span>
                        <span>{q.yearCompleted}</span>
                      </div>
                      <div className="text-slate mt-0.5">{q.institution}</div>
                      {q.subjectsAndGrades?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.subjectsAndGrades.map((sub, sIdx) => (
                            <span key={sIdx} className="rounded bg-white px-2 py-0.5 font-mono text-[11px] border border-slate/15">
                              {sub.subject}: <strong className="text-navy">{sub.grade}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate italic">No qualifications added yet.</p>
              )}
            </div>

            {/* Documents Section */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-navy text-lg">Uploaded Documents</h3>
                {isCurrent && (viewApp.status === "DRAFT" || viewApp.status === "DOCUMENTS_REQUIRED") && (
                  <Link href="/apply/portal/form?step=4" className="text-xs font-semibold text-brand-red hover:underline">
                    Manage Documents →
                  </Link>
                )}
              </div>
              {viewApp.documents?.length > 0 ? (
                <div className="space-y-2">
                  {viewApp.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg bg-ice px-3 py-2 text-xs border border-slate/10">
                      <span className="font-medium text-navy truncate mr-2">{doc.title}</span>
                      <div className="flex items-center gap-2">
                        {doc.verificationStatus === "verified" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                            <FontAwesomeIcon icon={faCircleCheck} className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                        {doc.verificationStatus === "rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-bold text-error">
                            <FontAwesomeIcon icon={faCircleXmark} className="h-2.5 w-2.5" /> Re-upload Needed
                          </span>
                        )}
                        {doc.verificationStatus === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-text">
                            <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" /> Pending
                          </span>
                        )}
                        <a
                          href={`/api/applicant/documents/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-red hover:underline text-xs ml-1"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate italic">No documents uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="premium-card p-6 space-y-3">
              <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-2">Application Actions</h4>
              {isCurrent && (viewApp.status === "DRAFT" || viewApp.status === "DOCUMENTS_REQUIRED") && (
                <Button href="/apply/portal/form" variant="primary" className="w-full text-xs">
                  {viewApp.status === "DRAFT" ? "Continue Application Form" : "Upload Requested Documents"}
                </Button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-lg border border-slate/20 bg-white py-2.5 text-xs font-semibold text-navy hover:bg-ice transition flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5" /> Print / Save Summary
              </button>
            </div>

            {/* Previous Applications */}
            {previousApplications.length > 0 && (
              <div className="premium-card p-6">
                <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="h-3.5 w-3.5 text-gold-text" />
                  Previous Applications
                </h4>
                <div className="space-y-2">
                  {[app, ...previousApplications].map((a) => {
                    const active = a.id === viewApp.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedId(a.id === app.id ? null : a.id)}
                        className={`w-full text-left rounded-lg border px-3 py-2.5 text-xs transition ${
                          active ? "border-gold bg-gold/10" : "border-slate/15 bg-ice hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-navy">{a.applicationNumber}</span>
                          {a.id === app.id && (
                            <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[9px] font-bold uppercase text-navy">Current</span>
                          )}
                        </div>
                        <div className="mt-1 truncate text-slate">{a.programmeChoice?.programmeTitle || "No programme selected"}</div>
                        <div className="mt-2">{getStatusBadge(a.status)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div className="premium-card p-6">
                <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-4">Status History</h4>
                <div className="space-y-3">
                  {statusHistory.map((ev) => {
                    const key = ev.action.replace("Status changed to ", "").trim().replace(/ /g, "_");
                    const meta = statusMeta(key);
                    return (
                      <div key={ev.id} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ice text-navy">
                          <FontAwesomeIcon icon={meta.icon} className="h-3 w-3" />
                        </span>
                        <div className="text-xs">
                          <div className="font-bold text-navy">{meta.label}</div>
                          <div className="text-[10px] text-slate">{formatDateTime(ev.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="premium-card p-6">
              <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-4">Application History</h4>
              <div className="relative border-l-2 border-slate/20 ml-2 space-y-4 text-xs">
                {viewApp.timeline?.map((ev) => (
                  <div key={ev.id} className="relative pl-4">
                    <span className="absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-gold border-2 border-white text-navy">
                      <FontAwesomeIcon icon={timelineIcon(ev.action)} className="h-2.5 w-2.5" />
                    </span>
                    <div className="font-bold text-navy">{ev.action}</div>
                    <div className="text-[10px] text-slate">{formatDateTime(ev.timestamp)}</div>
                    {ev.details && <p className="text-charcoal mt-1 text-[11px] leading-relaxed">{ev.details}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="rounded-xl bg-navy p-5 text-white text-xs">
              <h4 className="font-bold text-gold text-sm mb-1">Admissions Assistance</h4>
              <p className="text-white/80 mb-3">
                Have questions regarding your application or required documents? Contact our admissions officers directly.
              </p>
              <div className="space-y-1.5 font-mono text-white/90">
                <div className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gold" /> +94 81 220 1650</div>
                <div className="flex items-center gap-2"><FontAwesomeIcon icon={faWhatsapp} className="h-3 w-3 text-gold" /> WhatsApp: +94 74 250 9424</div>
                <div className="flex items-center gap-2"><FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-gold" /> nextwaycollege@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
