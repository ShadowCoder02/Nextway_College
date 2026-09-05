"use client";

import { useState } from "react";
import type { DocumentCategory, UploadedDocument } from "@/types/admissions";
import { apiFetch } from "@/lib/api-fetch";

interface DocumentSlot {
  category: DocumentCategory;
  title: string;
  description: string;
  required: boolean;
}

const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    category: "nic_passport",
    title: "National Identity Card (NIC) / Passport",
    description: "Clear copy of both sides of your NIC or data page of your valid Passport (PDF or Image).",
    required: true,
  },
  {
    category: "academic_ol",
    title: "GCE O/L Certificate or Results Sheet",
    description: "Certified copy or official statement of results for Ordinary Level examinations.",
    required: true,
  },
  {
    category: "academic_al",
    title: "GCE A/L Certificate or Results Sheet",
    description: "Advanced Level examination results sheet or predicted grades if pending results.",
    required: false,
  },
  {
    category: "birth_certificate",
    title: "Birth Certificate",
    description: "Official original birth certificate copy with translation if applicable.",
    required: true,
  },
  {
    category: "photograph",
    title: "Passport Size Photograph",
    description: "Recent colour photograph with plain white background (JPG, PNG, WebP).",
    required: true,
  },
  {
    category: "higher_education",
    title: "Higher Education / Diploma / Transcripts",
    description: "Previous degree, diploma, HND certificates or academic transcripts if applicable.",
    required: false,
  },
  {
    category: "other",
    title: "Other Supporting Documents",
    description: "CV, English proficiency certificates, employer letters, or award records.",
    required: false,
  },
];

interface DocumentUploaderProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  isReadOnly?: boolean;
}

export function DocumentUploader({
  documents,
  onDocumentsChange,
  isReadOnly = false,
}: DocumentUploaderProps) {
  const [uploadingCategory, setUploadingCategory] = useState<DocumentCategory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  async function handleFileUpload(category: DocumentCategory, title: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`File "${file.name}" exceeds the 5MB size limit.`);
      e.target.value = "";
      return;
    }

    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setErrorMsg(`File "${file.name}" is not a supported format. Please upload PDF, JPG, PNG, or WebP.`);
      e.target.value = "";
      return;
    }

    setUploadingCategory(category);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("title", title);

      const res = await apiFetch("/api/applicant/application/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Document upload failed. Please try again.");
      } else {
        onDocumentsChange(data.application.documents || []);
        setSuccessMsg(`Successfully uploaded ${title}!`);
      }
    } catch {
      setErrorMsg("Network error while uploading. Please try again.");
    } finally {
      setUploadingCategory(null);
      e.target.value = "";
    }
  }

  async function handleDeleteDocument(documentId: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await apiFetch(`/api/applicant/application/documents?id=${documentId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Failed to remove document.");
      } else {
        onDocumentsChange(data.application.documents || []);
        setSuccessMsg(`Removed ${title}`);
      }
    } catch {
      setErrorMsg("Network error while deleting. Please try again.");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success flex items-center justify-between">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      <div className="grid gap-5">
        {DOCUMENT_SLOTS.map((slot) => {
          const matchingDocs = documents.filter((d) => d.category === slot.category);
          const isUploading = uploadingCategory === slot.category;

          return (
            <div
              key={slot.category}
              className="rounded-xl border border-slate/20 bg-white p-5 shadow-sm transition hover:border-navy/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-navy text-base">{slot.title}</h4>
                    {slot.required ? (
                      <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold text-brand-red uppercase">
                        Required
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate/10 px-2 py-0.5 text-[10px] font-semibold text-slate uppercase">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate">{slot.description}</p>
                </div>

                {!isReadOnly && (
                  <div className="shrink-0">
                    <label className="relative inline-flex items-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => handleFileUpload(slot.category, slot.title, e)}
                      />
                      <span className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gold bg-gold/10 px-4 py-2 text-xs font-bold text-navy transition hover:bg-gold hover:text-white disabled:opacity-50">
                        {isUploading ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5 text-navy" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : matchingDocs.length > 0 ? (
                          "+ Upload Another / Replace"
                        ) : (
                          "Upload Document"
                        )}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Uploaded files for this slot */}
              {matchingDocs.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-ice pt-3">
                  {matchingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg bg-ice px-3 py-2.5 text-xs text-charcoal"
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <span className="font-bold text-navy uppercase text-[10px] rounded bg-white px-1.5 py-0.5 border border-slate/20">
                          {doc.mimeType.includes("pdf") ? "PDF" : "IMG"}
                        </span>
                        <a
                          href={`/api/applicant/documents/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-medium text-navy hover:text-brand-red hover:underline"
                          title="Click to view file"
                        >
                          {doc.originalFilename}
                        </a>
                        <span className="text-slate shrink-0">({formatBytes(doc.fileSize)})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.verificationStatus === "verified" && (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 font-bold text-success text-[10px]">
                            ✓ Verified
                          </span>
                        )}
                        {doc.verificationStatus === "rejected" && (
                          <span
                            className="rounded-full bg-error/15 px-2 py-0.5 font-bold text-error text-[10px]"
                            title={doc.rejectionReason ? `Reason: ${doc.rejectionReason}` : "Document rejected"}
                          >
                            ✕ Needs Re-upload
                          </span>
                        )}
                        {doc.verificationStatus === "pending" && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 font-bold text-gold text-[10px]">
                            ● Pending Verification
                          </span>
                        )}

                        <a
                          href={`/api/applicant/documents/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-white px-2 py-1 text-slate hover:text-navy border border-slate/20"
                        >
                          View
                        </a>

                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="rounded bg-white px-2 py-1 text-error hover:bg-error/10 border border-error/30 transition"
                            title="Remove file"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
