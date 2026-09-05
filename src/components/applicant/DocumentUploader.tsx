"use client";

import { useState } from "react";
import type { DocumentCategory, UploadedDocument } from "@/types/admissions";
import { getCsrfToken } from "@/lib/csrf-client";

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

const VALID_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const HEIC_EXTENSIONS = [".heic", ".heif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface DocumentUploaderProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  isReadOnly?: boolean;
}

type RetryState = { category: DocumentCategory; title: string; file: File } | null;

function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<{ status: number; data: { ok?: boolean; error?: string; application?: { documents: UploadedDocument[] } } }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("x-csrf-token", getCsrfToken());
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) });
      } catch {
        resolve({ status: xhr.status, data: {} });
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export function DocumentUploader({
  documents,
  onDocumentsChange,
  isReadOnly = false,
}: DocumentUploaderProps) {
  const [uploadingCategory, setUploadingCategory] = useState<DocumentCategory | null>(null);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [retry, setRetry] = useState<RetryState>(null);

  async function convertHeicIfNeeded(file: File): Promise<File> {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!HEIC_EXTENSIONS.includes(ext)) return file;

    setConverting(true);
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
      return new File([jpegBlob], newName, { type: "image/jpeg" });
    } catch {
      throw new Error("Unable to convert this HEIC photo. Please export it as JPG and try again.");
    } finally {
      setConverting(false);
    }
  }

  async function doUpload(category: DocumentCategory, title: string, file: File) {
    setUploadingCategory(category);
    setProgress(0);
    setRetry(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("title", title);

      const { status, data } = await uploadWithProgress("/api/applicant/application/documents", formData, setProgress);

      if (status < 200 || status >= 300 || !data.ok) {
        setErrorMsg(data.error || "Document upload failed. Please try again.");
      } else {
        onDocumentsChange(data.application?.documents || []);
        setSuccessMsg(`Successfully uploaded ${title}!`);
      }
    } catch {
      // A genuine connection drop, not a validation rejection — offer retry
      // with the same file rather than making the applicant reselect it.
      setErrorMsg(`Connection dropped while uploading "${file.name}". Your mobile network may be unstable.`);
      setRetry({ category, title, file });
    } finally {
      setUploadingCategory(null);
      setProgress(0);
    }
  }

  async function handleFileUpload(category: DocumentCategory, title: string, e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setErrorMsg("");
    setSuccessMsg("");
    setRetry(null);
    const resetInput = () => {
      e.target.value = "";
    };

    if (rawFile.size === 0) {
      setErrorMsg(`File "${rawFile.name}" is empty (0 bytes). Please choose a different file.`);
      resetInput();
      return;
    }

    if (rawFile.size > MAX_SIZE_BYTES) {
      setErrorMsg(`File "${rawFile.name}" exceeds the 5MB size limit.`);
      resetInput();
      return;
    }

    const ext = "." + (rawFile.name.split(".").pop()?.toLowerCase() ?? "");
    if (!VALID_EXTENSIONS.includes(ext) && !HEIC_EXTENSIONS.includes(ext)) {
      setErrorMsg(`File "${rawFile.name}" is not a supported format. Please upload PDF, JPG, PNG, WebP, or HEIC.`);
      resetInput();
      return;
    }

    let file: File;
    try {
      file = await convertHeicIfNeeded(rawFile);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to process this file.");
      resetInput();
      return;
    }

    resetInput();
    await doUpload(category, title, file);
  }

  async function handleRetry() {
    if (!retry) return;
    setErrorMsg("");
    await doUpload(retry.category, retry.title, retry.file);
  }

  async function handleDeleteDocument(documentId: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/applicant/application/documents?id=${documentId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
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
      <div aria-live="polite">
        {errorMsg && (
          <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error flex items-center justify-between" role="alert">
            <span>{errorMsg}</span>
            <span className="flex items-center gap-3 shrink-0 ml-4">
              {retry && (
                <button type="button" onClick={handleRetry} className="text-xs font-bold underline">
                  Retry upload
                </button>
              )}
              <button type="button" onClick={() => { setErrorMsg(""); setRetry(null); }} className="text-xs underline">
                Dismiss
              </button>
            </span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success flex items-center justify-between">
            <span>{successMsg}</span>
            <button type="button" onClick={() => setSuccessMsg("")} className="text-xs underline ml-4">Dismiss</button>
          </div>
        )}
      </div>

      <div className="grid gap-5">
        {DOCUMENT_SLOTS.map((slot) => {
          const matchingDocs = documents.filter((d) => d.category === slot.category);
          const isUploading = uploadingCategory === slot.category;
          const isConverting = isUploading && converting;

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
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => handleFileUpload(slot.category, slot.title, e)}
                      />
                      <span className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gold bg-gold/10 px-4 py-2 text-xs font-bold text-navy transition hover:bg-gold hover:text-white disabled:opacity-50">
                        {isConverting ? (
                          "Converting photo..."
                        ) : isUploading ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5 text-navy" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading {progress}%
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

              {isUploading && !isConverting && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-ice">
                  <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}

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
