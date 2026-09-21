"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import type { EnquiryFormData } from "@/lib/validation";
import { Button } from "./Button";
import { cn, whatsappUrl } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";
import { SITE } from "@/constants/site";

type LeadFormProps = {
  source?: string;
  programmeId?: string;
  programmeTitle?: string;
  className?: string;
  compact?: boolean;
};

const MESSAGE_MAX_LENGTH = 1000;

const loadValidation = () => import("@/lib/validation");
const warmValidation = () => {
  void loadValidation();
};

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
  const [referenceId, setReferenceId] = useState("");
  const [valid, setValid] = useState<Partial<Record<"fullName" | "phone" | "email", boolean>>>({});

  /** Inline validation on blur (and while fixing an error): same schema as
   * submit, so the messages match; the server re-validates everything. */
  async function validateField(name: "fullName" | "phone" | "email", value: string) {
    const { enquirySchema } = await loadValidation();
    const result = enquirySchema.shape[name].safeParse(value);
    setErrors((prev) => ({ ...prev, [name]: result.success ? undefined : result.error.issues[0]?.message }));
    setValid((prev) => ({ ...prev, [name]: result.success }));
  }
  const fieldHandlers = (name: "fullName" | "phone" | "email") => ({
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value.trim() || errors[name]) void validateField(name, e.target.value);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (errors[name]) void validateField(name, e.target.value);
      else if (valid[name] === false) setValid((prev) => ({ ...prev, [name]: undefined }));
    },
  });

  const fieldRefs = {
    fullName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  };

  function focusFirstInvalid(fieldErrors: Partial<Record<keyof EnquiryFormData, string>>) {
    const field = (["fullName", "phone", "email", "consent"] as const).find((f) => fieldErrors[f]);
    if (field) fieldRefs[field].current?.focus();
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

    // The schema (and libphonenumber-js behind it, ~45kB gz) is fetched on
    // first interaction — see `warmValidation` — not shipped with the page.
    const { enquirySchema } = await loadValidation();
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
      setReferenceId(typeof json.id === "string" ? `ENQ-${json.id.slice(0, 8).toUpperCase()}` : "");
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
      <div
        className={cn("rounded-[var(--radius-card)] bg-success/10 p-8 text-center", className)}
        role="status"
        aria-live="polite"
      >
        <h3 className="mb-2 text-xl font-bold text-success">Thank you!</h3>
        <p className="text-charcoal">Your enquiry has been received.</p>
        {referenceId && (
          <p className="mt-2 text-sm text-slate">
            Reference number: <span className="font-mono font-bold text-navy">{referenceId}</span>
          </p>
        )}
        <p className="mt-4 text-sm text-charcoal">
          Our Admissions team reviews enquiries daily and will contact you within{" "}
          <strong>1–2 business days</strong>.
        </p>

        <div className="mt-6 rounded-lg bg-white/60 p-4 text-sm text-charcoal">
          <p className="mb-2 font-semibold text-navy">Need a faster answer?</p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${SITE.phoneTel}`} className="font-semibold text-brand-red hover:underline">
              Call {SITE.phone}
            </a>
            <a
              href={whatsappUrl(SITE.whatsapp, "Hi, I just submitted an enquiry and would like to follow up.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-red hover:underline"
            >
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" onClick={() => setStatus("idle")}>
            Submit another enquiry
          </Button>
          <Link href="/programmes" className="text-sm font-semibold text-navy underline underline-offset-2 hover:text-brand-red">
            Browse programmes
          </Link>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-lg border bg-white px-4 py-3 text-charcoal placeholder:text-slate/60 transition-colors focus:outline-none focus:ring-1";
  const inputClass = `${inputBase} border-slate/30 focus:border-gold focus:ring-gold`;
  const stateClass = (name: "fullName" | "phone" | "email") =>
    errors[name]
      ? `${inputBase} border-error focus:border-error focus:ring-error`
      : valid[name]
        ? `${inputBase} border-success/60 focus:border-success focus:ring-success`
        : inputClass;

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={warmValidation}
      onPointerEnter={warmValidation}
      aria-busy={status === "loading"}
      className={cn("space-y-4", className)}
      noValidate
    >
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
            className={stateClass("fullName")}
            {...fieldHandlers("fullName")}
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${uid}-fullName-error` : undefined}
          />
          {errors.fullName && (
            <p id={`${uid}-fullName-error`} className="field-error mt-1 text-sm text-error" role="alert">{errors.fullName}</p>
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
            className={stateClass("phone")}
            {...fieldHandlers("phone")}
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${uid}-phone-error` : `${uid}-phone-hint`}
          />
          <p id={`${uid}-phone-hint`} className="mt-1 text-xs text-slate">Sri Lankan number, e.g. 077 123 4567.</p>
          {errors.phone && (
            <p id={`${uid}-phone-error`} className="field-error mt-1 text-sm text-error" role="alert">{errors.phone}</p>
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
          className={stateClass("email")}
          {...fieldHandlers("email")}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
        />
        {errors.email && (
          <p id={`${uid}-email-error`} className="field-error mt-1 text-sm text-error" role="alert">{errors.email}</p>
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
          ref={fieldRefs.consent}
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
        <p id={`${uid}-consent-error`} className="field-error text-sm text-error" role="alert">{errors.consent}</p>
      )}

      {serverError && (
        <p className="text-sm text-error" role="alert" aria-live="polite">{serverError}</p>
      )}

      <Button type="submit" variant="primary" loading={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Submitting…" : "Submit enquiry"}
      </Button>
      {status === "loading" && (
        <>
          <div className="submit-progress h-1 overflow-hidden rounded-full bg-ice" aria-hidden="true">
            <span className="block h-full w-1/3 rounded-full bg-brand-red" style={{ animation: "submitProgress 1.1s ease-in-out infinite" }} />
          </div>
          <p role="status" className="sr-only">Submitting your enquiry…</p>
        </>
      )}
    </form>
  );
}
