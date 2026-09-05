"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ApplicationStatus,
  DocumentVerificationStatus,
  StudentApplication,
} from "@/types/admissions";
import { formatDate, formatDateTime } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

interface ApplicationReviewerProps {
  initialApplication: StudentApplication;
}

export function ApplicationReviewer({ initialApplication }: ApplicationReviewerProps) {
  const [app, setApp] = useState<StudentApplication>(initialApplication);
  const [statusInput, setStatusInput] = useState<ApplicationStatus>(app.status);
  const [statusNotes, setStatusNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Notes
  const [noteInput, setNoteInput] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Interview modal/form
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewVenue, setInterviewVenue] = useState("Zoom Video Conference");
  const [interviewInstructions, setInterviewInstructions] = useState("");
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  // Request docs
  const [showRequestDocs, setShowRequestDocs] = useState(false);
  const [requestDocsText, setRequestDocsText] = useState("");
  const [submittingDocRequest, setSubmittingDocRequest] = useState(false);

  // Feedback messages
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  }

  // Update Status
  async function handleStatusUpdate() {
    setSavingStatus(true);
    try {
      const res = await apiFetch(`/api/portal/applications/${app.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusInput, notes: statusNotes }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setApp(data.application);
        setStatusNotes("");
        showToast("Application status updated successfully.");
      }
    } catch {
      alert("Failed to update status.");
    } finally {
      setSavingStatus(false);
    }
  }

  // Verify Document
  async function handleVerifyDocument(
    docId: string,
    status: DocumentVerificationStatus,
    reason?: string,
  ) {
    try {
      const res = await apiFetch(`/api/portal/applications/${app.id}/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setApp(data.application);
        showToast(`Document marked as ${status}.`);
      }
    } catch {
      alert("Failed to update document verification status.");
    }
  }

  // Add Internal Note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setAddingNote(true);

    try {
      const res = await apiFetch(`/api/portal/applications/${app.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteInput, isInternal: true }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setApp(data.application);
        setNoteInput("");
        showToast("Internal note recorded.");
      }
    } catch {
      alert("Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  }

  // Schedule Interview
  async function handleScheduleInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!interviewDate || !interviewVenue) return;
    setSchedulingInterview(true);

    try {
      // The <input type="datetime-local"> value has no timezone (e.g.
      // "2026-09-15T14:00") — admissions staff schedule in Colombo time, so
      // attach that offset explicitly now rather than storing an ambiguous
      // timestamp that a later formatter would have to guess at.
      const scheduledAt = `${interviewDate}:00+05:30`;
      const res = await apiFetch(`/api/portal/applications/${app.id}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          venueOrLink: interviewVenue,
          instructions: interviewInstructions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setApp(data.application);
        setShowInterviewForm(false);
        showToast("Interview scheduled successfully.");
      }
    } catch {
      alert("Failed to schedule interview.");
    } finally {
      setSchedulingInterview(false);
    }
  }

  // Request Documents
  async function handleRequestDocuments(e: React.FormEvent) {
    e.preventDefault();
    if (!requestDocsText) return;
    setSubmittingDocRequest(true);

    try {
      const res = await apiFetch(`/api/portal/applications/${app.id}/request-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: requestDocsText }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setApp(data.application);
        setShowRequestDocs(false);
        setRequestDocsText("");
        showToast("Document request sent to applicant.");
      }
    } catch {
      alert("Failed to request documents.");
    } finally {
      setSubmittingDocRequest(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/applications"
          className="text-xs font-bold text-navy hover:text-brand-red flex items-center gap-1"
        >
          ← Back to All Applications
        </Link>
        <span className="text-xs font-mono bg-white px-3 py-1 rounded-full border border-slate/20">
          ID: {app.applicationNumber}
        </span>
      </div>

      {toastMsg && (
        <div className="rounded-lg bg-success/15 border border-success/30 p-4 text-xs font-bold text-success">
          {toastMsg}
        </div>
      )}

      {/* Header Dossier Summary */}
      <div className="premium-card p-6 sm:p-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ice">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Applicant Dossier</span>
            <h1 className="text-2xl font-bold text-navy mt-0.5">
              {app.personalInfo?.title} {app.personalInfo?.fullName || "Applicant"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate">
              <span>Email: <strong className="text-navy">{app.personalInfo?.email}</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-navy">{app.personalInfo?.phone}</strong></span>
              <span>•</span>
              <span>NIC/Passport: <strong className="text-navy">{app.personalInfo?.nicOrPassport}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInterviewForm(!showInterviewForm)}
              className="rounded-lg border border-navy/20 bg-ice px-3 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white transition"
            >
              📅 Schedule Interview
            </button>
            <button
              type="button"
              onClick={() => setShowRequestDocs(!showRequestDocs)}
              className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-xs font-bold text-brand-red hover:bg-brand-red hover:text-white transition"
            >
              ⚠️ Request Documents
            </button>
          </div>
        </div>

        {/* Status Control Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-navy shrink-0">Current Status:</span>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as ApplicationStatus)}
              className="rounded-lg border border-slate/30 bg-white px-3 py-1.5 text-xs font-semibold text-navy focus:outline-none"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="DOCUMENTS_REQUIRED">DOCUMENTS_REQUIRED</option>
              <option value="DOCUMENTS_VERIFICATION">DOCUMENTS_VERIFICATION</option>
              <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
              <option value="APPROVED">APPROVED (Offer Made)</option>
              <option value="ENROLLED">ENROLLED</option>
              <option value="WAITLISTED">WAITLISTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="WITHDRAWN">WITHDRAWN</option>
            </select>
            <button
              type="button"
              disabled={savingStatus || statusInput === app.status}
              onClick={handleStatusUpdate}
              className="rounded-lg bg-gold px-4 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white transition disabled:opacity-40"
            >
              {savingStatus ? "Updating..." : "Update Status"}
            </button>
          </div>

          <div className="text-xs text-slate">
            Submitted: <strong>{app.submittedAt ? formatDateTime(app.submittedAt) : "Draft"}</strong>
          </div>
        </div>
      </div>

      {/* SCHEDULE INTERVIEW MODAL/CARD */}
      {showInterviewForm && (
        <form onSubmit={handleScheduleInterview} className="rounded-xl border border-navy/20 bg-ice p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Schedule Admission Interview</h3>
            <button type="button" onClick={() => setShowInterviewForm(false)} className="text-xs text-slate">✕ Close</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                className="input-premium text-xs"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Venue / Online Link *</label>
              <input
                type="text"
                required
                className="input-premium text-xs"
                value={interviewVenue}
                onChange={(e) => setInterviewVenue(e.target.value)}
                placeholder="e.g. Zoom Link or Kandy Campus Boardroom"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-navy mb-1">Special Instructions for Applicant</label>
              <textarea
                rows={2}
                className="input-premium text-xs"
                value={interviewInstructions}
                onChange={(e) => setInterviewInstructions(e.target.value)}
                placeholder="Please bring original A/L result sheets and photo ID..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={schedulingInterview}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-gold hover:text-navy transition"
          >
            {schedulingInterview ? "Scheduling..." : "Confirm & Save Interview"}
          </button>
        </form>
      )}

      {/* REQUEST DOCUMENTS MODAL/CARD */}
      {showRequestDocs && (
        <form onSubmit={handleRequestDocuments} className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-brand-red text-sm uppercase tracking-wider">Request Additional Documents</h3>
            <button type="button" onClick={() => setShowRequestDocs(false)} className="text-xs text-slate">✕ Close</button>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy mb-1">Instructions for Applicant *</label>
            <textarea
              rows={3}
              required
              className="input-premium text-xs"
              value={requestDocsText}
              onChange={(e) => setRequestDocsText(e.target.value)}
              placeholder="e.g. The uploaded O/L result sheet is blurred. Please upload a clear official statement of results."
            />
          </div>
          <button
            type="submit"
            disabled={submittingDocRequest}
            className="rounded-lg bg-brand-red px-4 py-2 text-xs font-bold text-white hover:bg-navy transition"
          >
            {submittingDocRequest ? "Submitting..." : "Send Document Request"}
          </button>
        </form>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Programme Selected */}
          <div className="premium-card p-6">
            <h3 className="font-bold text-navy text-base mb-4 pb-2 border-b border-ice">Programme & Intake Choice</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate block">Programme:</span>
                <strong className="text-navy text-sm font-semibold">{app.programmeChoice?.programmeTitle || "—"}</strong>
              </div>
              <div>
                <span className="text-slate block">Level:</span>
                <strong className="text-navy">{app.programmeChoice?.level || "—"}</strong>
              </div>
              <div>
                <span className="text-slate block">Intake:</span>
                <strong className="text-navy">{app.programmeChoice?.intake || "—"}</strong>
              </div>
              <div>
                <span className="text-slate block">Campus / Mode:</span>
                <strong className="text-navy">{app.programmeChoice?.campus} ({app.programmeChoice?.studyMode})</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="premium-card p-6">
            <h3 className="font-bold text-navy text-base mb-4 pb-2 border-b border-ice">Personal & Address Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate block">Date of Birth:</span>
                <strong className="text-navy">{app.personalInfo?.dateOfBirth} ({app.personalInfo?.gender})</strong>
              </div>
              <div>
                <span className="text-slate block">Nationality:</span>
                <strong className="text-navy">{app.personalInfo?.nationality}</strong>
              </div>
              <div>
                <span className="text-slate block">Residential Address:</span>
                <strong className="text-navy">{app.personalInfo?.addressLine1}, {app.personalInfo?.city} ({app.personalInfo?.country})</strong>
              </div>
              <div>
                <span className="text-slate block">Emergency Contact:</span>
                <strong className="text-navy">{app.personalInfo?.emergencyContactName}</strong>
              </div>
              <div>
                <span className="text-slate block">Emergency Phone:</span>
                <strong className="text-navy">{app.personalInfo?.emergencyContactPhone} ({app.personalInfo?.emergencyContactRelationship})</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Academic Qualifications */}
          <div className="premium-card p-6">
            <h3 className="font-bold text-navy text-base mb-4 pb-2 border-b border-ice">
              Academic Qualifications ({app.qualifications?.length || 0})
            </h3>
            {app.qualifications?.length > 0 ? (
              <div className="space-y-4">
                {app.qualifications.map((q, idx) => (
                  <div key={q.id || idx} className="rounded-xl bg-ice p-4 text-xs border border-slate/10 space-y-2">
                    <div className="flex justify-between font-bold text-navy text-sm">
                      <span>{q.qualificationType}</span>
                      <span>Completed: {q.yearCompleted}</span>
                    </div>
                    <div className="text-slate">Institution: <strong>{q.institution}</strong></div>
                    {q.subjectsAndGrades?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-slate/15">
                        {q.subjectsAndGrades.map((sub, sIdx) => (
                          <span key={sIdx} className="rounded bg-white px-2 py-1 text-xs font-mono border border-slate/15">
                            {sub.subject}: <strong className="text-navy">{sub.grade}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate italic">No qualifications listed.</p>
            )}
          </div>

          {/* Section 4: Document Verification */}
          <div className="premium-card p-6">
            <h3 className="font-bold text-navy text-base mb-4 pb-2 border-b border-ice">
              Uploaded Documents & Verification ({app.documents?.length || 0})
            </h3>
            {app.documents?.length > 0 ? (
              <div className="space-y-3">
                {app.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-ice p-4 border border-slate/15 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-navy text-sm">{doc.title}</strong>
                        {doc.verificationStatus === "verified" && (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                            ✓ Verified
                          </span>
                        )}
                        {doc.verificationStatus === "rejected" && (
                          <span className="rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-bold text-error">
                            ✕ Rejected
                          </span>
                        )}
                        {doc.verificationStatus === "pending" && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                            ● Pending
                          </span>
                        )}
                      </div>
                      <div className="text-slate mt-0.5 text-[11px]">
                        File: {doc.originalFilename} • Uploaded: {formatDate(doc.uploadedAt)}
                      </div>
                      {doc.rejectionReason && (
                        <div className="text-error font-medium text-[11px] mt-1">
                          Rejection Reason: {doc.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/api/portal/applications/${app.id}/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white px-3 py-1.5 font-bold text-navy hover:bg-navy hover:text-white border border-slate/20 transition"
                      >
                        View File ↗
                      </a>
                      {doc.verificationStatus !== "verified" && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc.id, "verified")}
                          className="rounded-lg bg-success px-3 py-1.5 font-bold text-white hover:opacity-90 transition"
                        >
                          Verify ✓
                        </button>
                      )}
                      {doc.verificationStatus !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt("Enter reason for document rejection:");
                            if (reason) handleVerifyDocument(doc.id, "rejected", reason);
                          }}
                          className="rounded-lg bg-error px-3 py-1.5 font-bold text-white hover:opacity-90 transition"
                        >
                          Reject ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate italic">No documents uploaded.</p>
            )}
          </div>
        </div>

        {/* Sidebar: Notes & Timeline */}
        <div className="space-y-6">
          {/* Internal Staff Notes */}
          <div className="premium-card p-6">
            <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-3">Internal Staff Notes</h4>
            <form onSubmit={handleAddNote} className="space-y-3 mb-4">
              <textarea
                rows={3}
                required
                className="input-premium text-xs"
                placeholder="Add confidential evaluation note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={addingNote}
                className="w-full rounded-lg bg-navy py-2 text-xs font-bold text-white hover:bg-gold hover:text-navy transition"
              >
                {addingNote ? "Saving..." : "Post Internal Note"}
              </button>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {app.notes?.map((n) => (
                <div key={n.id} className="rounded-lg bg-ice p-3 text-xs border border-slate/10">
                  <div className="flex justify-between font-bold text-navy text-[11px]">
                    <span>{n.authorName}</span>
                    <span className="text-slate font-normal">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-charcoal mt-1 leading-relaxed text-xs">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="premium-card p-6">
            <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-4">Audit Trail</h4>
            <div className="relative border-l-2 border-slate/20 ml-2 space-y-4 text-xs">
              {app.timeline?.map((ev) => (
                <div key={ev.id} className="relative pl-4">
                  <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-gold border-2 border-white" />
                  <div className="font-bold text-navy">{ev.action}</div>
                  <div className="text-[10px] text-slate">
                    By <strong>{ev.actor}</strong> • {formatDateTime(ev.timestamp)}
                  </div>
                  {ev.details && <p className="text-charcoal mt-0.5 text-[11px]">{ev.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
