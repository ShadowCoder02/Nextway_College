"use client";

import { useId, useRef, useState } from "react";
import { enquirySchema, type EnquiryFormData } from "@/lib/validation";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";

type LeadFormProps = {
  source?: string;
  programmeId?: string;
  programmeTitle?: string;
  className?: string;
  compact?: boolean;
};

const MESSAGE_MAX_LENGTH = 1000;

export function LeadForm({
  source = "website",
  programmeId,
  programmeTitle,
  className,
  compact,
}: LeadFormProps) {
  const uid = useId();
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormData, string>>>({});
  const [serverError, setServerError] = useState("");
  const [messageLength, setMessageLength] = useState(0);

  const fieldRefs = {
    fullName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  function focusFirstInvalid(fieldErrors: Partial<Record<keyof EnquiryFormData, string>>) {
    (["fullName", "phone", "email"] as const).forEach((field) => {
      if (fieldErrors[field] && fieldRefs[field].current) {
        fieldRefs[field].current!.focus();
      }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    if (!isOnline) {
      setServerError("You appear to be offline. Your details have been kept — reconnect and try again.");
      setStatus("error");
      return;
    }

    setStatus("loading");

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
      focusFirstInvalid(fieldErrors);
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
      setMessageLength(0);
    } catch {
      setServerError(
        isOnline
          ? "Network error. Please check your connection and try again."
          : "You appear to be offline. Your details have been kept — reconnect and try again.",
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={cn("rounded-[var(--radius-card)] bg-success/10 p-8 text-center", className)} role="status">
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

      <div aria-live="polite">
        {!isOnline && (
          <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-medium text-navy">
            You appear to be offline. You can keep filling this in — it won&apos;t submit until you&apos;re back online.
          </p>
        )}
      </div>

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor={`${uid}-fullName`} className="mb-1 block text-sm font-medium">
            Full name *
          </label>
          <input
            ref={fieldRefs.fullName}
            id={`${uid}-fullName`}
            name="fullName"
            className={inputClass}
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${uid}-fullName-error` : undefined}
          />
          {errors.fullName && (
            <p id={`${uid}-fullName-error`} className="mt-1 text-sm text-error" role="alert">{errors.fullName}</p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-phone`} className="mb-1 block text-sm font-medium">
            Phone *
          </label>
          <input
            ref={fieldRefs.phone}
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            placeholder="077 123 4567"
            className={inputClass}
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${uid}-phone-error` : `${uid}-phone-hint`}
          />
          <p id={`${uid}-phone-hint`} className="mt-1 text-xs text-slate">Sri Lankan number, e.g. 077 123 4567.</p>
          {errors.phone && (
            <p id={`${uid}-phone-error`} className="mt-1 text-sm text-error" role="alert">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-email`} className="mb-1 block text-sm font-medium">
          Email *
        </label>
        <input
          ref={fieldRefs.email}
          id={`${uid}-email`}
          name="email"
          type="email"
          className={inputClass}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
        />
        {errors.email && (
          <p id={`${uid}-email-error`} className="mt-1 text-sm text-error" role="alert">{errors.email}</p>
        )}
      </div>

      {!compact && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-qualification`} className="mb-1 block text-sm font-medium">
                Highest qualification
              </label>
              <input id={`${uid}-qualification`} name="qualification" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`${uid}-intake`} className="mb-1 block text-sm font-medium">
                Preferred intake
              </label>
              <input id={`${uid}-intake`} name="intake" className={inputClass} placeholder="e.g. 2026" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label htmlFor={`${uid}-message`} className="block text-sm font-medium">
                Message
              </label>
              <span className="text-xs text-slate">{messageLength}/{MESSAGE_MAX_LENGTH}</span>
            </div>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={4}
              maxLength={MESSAGE_MAX_LENGTH}
              className={inputClass}
              placeholder="Tell us about your goals or questions..."
              onChange={(e) => setMessageLength(e.target.value.length)}
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
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${uid}-consent-error` : undefined}
        />
        <span>
          I agree to be contacted by Nextway College International regarding my enquiry. *
        </span>
      </label>
      {errors.consent && (
        <p id={`${uid}-consent-error`} className="text-sm text-error" role="alert">{errors.consent}</p>
      )}

      {serverError && (
        <p className="text-sm text-error" role="alert" aria-live="polite">{serverError}</p>
      )}

      <Button type="submit" variant="primary" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Submitting..." : "Submit enquiry"}
      </Button>
    </form>
  );
}
