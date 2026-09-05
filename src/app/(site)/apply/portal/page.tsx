"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { StudentApplication } from "@/types/admissions";
import { Button } from "@/components/ui/Button";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const [app, setApp] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/applicant/application");
        if (res.status === 401) {
          router.push("/apply/login");
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error || "Failed to load application data.");
        } else {
          setApp(data.application);
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
    await fetch("/api/applicant/auth/logout", { method: "POST" });
    router.push("/apply/login");
    router.refresh();
  }

  async function handleDownloadPdf() {
    const res = await fetch("/api/applicant/application/pdf");
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

  // Calculate progress percentage
  const totalSlots = 5;
  let completedSteps = 0;
  if (app.personalInfo?.fullName && app.personalInfo?.nicOrPassport) completedSteps += 1;
  if (app.qualifications?.length > 0) completedSteps += 1;
  if (app.programmeChoice?.programmeId) completedSteps += 1;
  if (app.documents?.length > 0) completedSteps += 1;
  if (app.status !== "DRAFT") completedSteps += 1;
  const progressPercent = Math.round((completedSteps / totalSlots) * 100);

  function getStatusBadge(status: string) {
    switch (status) {
      case "DRAFT":
        return <Badge variant="slate">Draft (In Progress)</Badge>;
      case "SUBMITTED":
        return <Badge variant="navy">Submitted</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="gold">Under Review</Badge>;
      case "DOCUMENTS_REQUIRED":
        return <Badge variant="brand-red">Action: Documents Required</Badge>;
      case "DOCUMENTS_VERIFICATION":
        return <Badge variant="gold">Verifying Documents</Badge>;
      case "INTERVIEW_REQUIRED":
      case "INTERVIEW_SCHEDULED":
        return <Badge variant="navy">Interview Scheduled</Badge>;
      case "APPROVED":
        return <Badge variant="gold">✓ Offer Approved</Badge>;
      case "ENROLLED":
        return <Badge variant="gold">Enrolled</Badge>;
      case "REJECTED":
        return <Badge variant="brand-red">Not Successful</Badge>;
      case "WAITLISTED":
        return <Badge variant="slate">Waitlisted</Badge>;
      default:
        return <Badge>{status.replace(/_/g, " ")}</Badge>;
    }
  }

  return (
    <div className="bg-pearl min-h-screen py-10">
      <div className="container-nwc max-w-5xl space-y-8">
        {/* Top Header Card */}
        <div className="premium-card p-6 sm:p-8 bg-white border border-slate/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate/15">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold">Applicant Portal</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy mt-1">
                {app.personalInfo?.fullName || "Prospective Student"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate">
                <span>Application ID: <strong className="text-navy font-mono">{app.applicationNumber}</strong></span>
                <span>•</span>
                <span>Created: {formatDate(app.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate mb-1">Status</span>
                {getStatusBadge(app.status)}
              </div>
              {app.status === "SUBMITTED" && (
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
              <span className="text-gold font-bold">{progressPercent}%</span>
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
        {app.status === "DOCUMENTS_REQUIRED" && (
          <div className="rounded-xl border border-brand-red/30 bg-brand-red/10 p-6 text-charcoal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-brand-red text-lg">Action Required: Additional Documents Requested</h3>
                <p className="text-sm mt-1 text-charcoal/90">
                  {app.requestedDocumentsNotes || "Admissions requires updated credentials to complete evaluation."}
                </p>
              </div>
              <Button href="/apply/portal/form?step=4" variant="primary" size="sm" className="shrink-0">
                Upload Documents Now
              </Button>
            </div>
          </div>
        )}

        {app.status === "INTERVIEW_SCHEDULED" && app.interview && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-6 text-charcoal">
            <h3 className="font-bold text-navy text-lg">Interview Scheduled</h3>
            <p className="text-sm mt-1 text-slate">
              Please attend your scheduled admission interview:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs bg-white rounded-lg p-4 border border-gold/20">
              <div>
                <span className="text-slate block">Date & Time:</span>
                <strong className="text-navy text-sm font-semibold">
                  {formatDateTime(app.interview.scheduledAt)}
                </strong>
              </div>
              <div>
                <span className="text-slate block">Location / Meeting Link:</span>
                <strong className="text-navy text-sm font-semibold">{app.interview.venueOrLink}</strong>
              </div>
              {app.interview.instructions && (
                <div className="sm:col-span-2 pt-2 border-t border-slate/10">
                  <span className="text-slate block">Special Instructions:</span>
                  <p className="text-charcoal mt-0.5">{app.interview.instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {app.status === "APPROVED" && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-charcoal">
            <h3 className="font-bold text-success text-xl">🎉 Congratulations! Your Application has been Approved</h3>
            <p className="text-sm mt-2 leading-relaxed text-charcoal">
              We are delighted to offer you admission to <strong>{app.programmeChoice?.programmeTitle}</strong> for the {app.programmeChoice?.intake}. An official admission letter will be dispatched to your email address.
            </p>
          </div>
        )}

        {app.status === "DRAFT" && (
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
                {app.status === "DRAFT" && (
                  <Link href="/apply/portal/form?step=3" className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </Link>
                )}
              </div>
              {app.programmeChoice?.programmeTitle ? (
                <div className="rounded-xl bg-ice p-4 border border-slate/10 space-y-2 text-sm">
                  <div className="font-bold text-navy text-base">{app.programmeChoice.programmeTitle}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate">
                    <div>Level: <strong className="text-navy">{app.programmeChoice.level}</strong></div>
                    <div>Intake: <strong className="text-navy">{app.programmeChoice.intake}</strong></div>
                    <div>Mode: <strong className="text-navy">{app.programmeChoice.studyMode}</strong></div>
                    <div>Campus: <strong className="text-navy">{app.programmeChoice.campus}</strong></div>
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
                {app.status === "DRAFT" && (
                  <Link href="/apply/portal/form?step=2" className="text-xs font-semibold text-brand-red hover:underline">
                    Edit →
                  </Link>
                )}
              </div>
              {app.qualifications?.length > 0 ? (
                <div className="space-y-3">
                  {app.qualifications.map((q, idx) => (
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
                {(app.status === "DRAFT" || app.status === "DOCUMENTS_REQUIRED") && (
                  <Link href="/apply/portal/form?step=4" className="text-xs font-semibold text-brand-red hover:underline">
                    Manage Documents →
                  </Link>
                )}
              </div>
              {app.documents?.length > 0 ? (
                <div className="space-y-2">
                  {app.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg bg-ice px-3 py-2 text-xs border border-slate/10">
                      <span className="font-medium text-navy truncate mr-2">{doc.title}</span>
                      <div className="flex items-center gap-2">
                        {doc.verificationStatus === "verified" && (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                            ✓ Verified
                          </span>
                        )}
                        {doc.verificationStatus === "rejected" && (
                          <span className="rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-bold text-error">
                            ✕ Re-upload Needed
                          </span>
                        )}
                        {doc.verificationStatus === "pending" && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                            ● Pending
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
              {(app.status === "DRAFT" || app.status === "DOCUMENTS_REQUIRED") && (
                <Button href="/apply/portal/form" variant="primary" className="w-full text-xs">
                  {app.status === "DRAFT" ? "Continue Application Form" : "Upload Requested Documents"}
                </Button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-lg border border-slate/20 bg-white py-2.5 text-xs font-semibold text-navy hover:bg-ice transition flex items-center justify-center gap-2"
              >
                <span>🖨️</span> Print / Save Summary
              </button>
            </div>

            {/* Timeline */}
            <div className="premium-card p-6">
              <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-4">Application History</h4>
              <div className="relative border-l-2 border-slate/20 ml-2 space-y-4 text-xs">
                {app.timeline?.map((ev) => (
                  <div key={ev.id} className="relative pl-4">
                    <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-gold border-2 border-white" />
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
              <div className="space-y-1 font-mono text-white/90">
                <div>📞 +94 81 220 1650</div>
                <div>💬 WhatsApp: +94 74 250 9424</div>
                <div>✉️ nextwaycollege@gmail.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
