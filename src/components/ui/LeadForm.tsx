"use client";

import { useState } from "react";
import { enquirySchema, type EnquiryFormData } from "@/lib/validation";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

type LeadFormProps = {
  source?: string;
  programmeId?: string;
  programmeTitle?: string;
  className?: string;
  compact?: boolean;
};

export function LeadForm({
  source = "website",
  programmeId,
  programmeTitle,
  className,
  compact,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormData, string>>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    setServerError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = {
      fullName: fd.get("fullName") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      qualification: (fd.get("qualification") as string) || undefined,
      intake: (fd.get("intake") as string) || undefined,
      message: (fd.get("message") as string) || undefined,
      programmeId,
      programmeTitle,
      source,
      consent: fd.get("consent") === "on",
    };

    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof EnquiryFormData, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof EnquiryFormData;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setStatus("idle");
      return;
    }

    try {
      const res = await apiFetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Submission failed. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={cn("rounded-[var(--radius-card)] bg-success/10 p-8 text-center", className)}>
        <h3 className="mb-2 text-xl font-bold text-success">Thank you!</h3>
        <p className="text-charcoal">
          Your enquiry has been received. Our Admissions team will contact you shortly.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => setStatus("idle")}>
          Submit another enquiry
        </Button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-charcoal placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      {programmeTitle && (
        <p className="rounded-lg bg-ice px-4 py-3 text-sm">
          Enquiring about: <strong>{programmeTitle}</strong>
        </p>
      )}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Full name *
          </label>
          <input id="fullName" name="fullName" className={inputClass} required />
          {errors.fullName && <p className="mt-1 text-sm text-error">{errors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone *
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} required />
          {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email *
        </label>
        <input id="email" name="email" type="email" className={inputClass} required />
        {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
      </div>

      {!compact && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qualification" className="mb-1 block text-sm font-medium">
                Highest qualification
              </label>
              <input id="qualification" name="qualification" className={inputClass} />
            </div>
            <div>
              <label htmlFor="intake" className="mb-1 block text-sm font-medium">
                Preferred intake
              </label>
              <input id="intake" name="intake" className={inputClass} placeholder="e.g. 2026" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className={inputClass}
              placeholder="Tell us about your goals or questions..."
            />
          </div>
        </>
      )}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="consent"
          className="mt-1 h-4 w-4 accent-gold"
          required
        />
        <span>
          I agree to be contacted by Nextway College International regarding my enquiry. *
        </span>
      </label>
      {errors.consent && <p className="text-sm text-error">{errors.consent}</p>}

      {serverError && <p className="text-sm text-error">{serverError}</p>}

      <Button type="submit" variant="primary" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Submitting..." : "Submit enquiry"}
      </Button>
    </form>
  );
}
