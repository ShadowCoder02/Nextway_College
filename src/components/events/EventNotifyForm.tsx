"use client";

import { useId, useRef, useState } from "react";
import { eventNotifySchema } from "@/lib/event-validation";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";
import { Button } from "@/components/ui/Button";

type FieldErrors = Partial<Record<"email" | "name" | "consent", string>>;

/** Email capture for "tell me when the next event is scheduled". The server
 * re-validates everything (POST /api/events/notify); the checks here only
 * give faster, inline feedback. */
export function EventNotifyForm() {
  const uid = useId();
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setErrors({});
    setServerError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = {
      name: (fd.get("name") as string) || undefined,
      email: fd.get("email") as string,
      consent: fd.get("consent") === "on",
    };
    const parsed = eventNotifySchema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      (next.email ? emailRef : consentRef).current?.focus();
      return;
    }
    if (!isOnline) {
      setServerError("You appear to be offline. Your details are kept — reconnect and try again.");
      return;
    }

    setStatus("loading");
    try {
      const res = await apiFetch("/api/events/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setServerError("Network error. Please check your connection and try again — your details are kept.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg bg-success/10 p-5 text-center text-success">
        <p className="font-bold">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-charcoal">Admissions will let you know when the next event is scheduled.</p>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-md space-y-3 text-left">
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1 block text-sm font-medium">
          Email address *
        </label>
        <input
          ref={emailRef}
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="email"
          className={input}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${uid}-email-err` : undefined}
        />
        {errors.email && (
          <p id={`${uid}-email-err`} role="alert" className="mt-1 text-sm text-error">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${uid}-name`} className="mb-1 block text-sm font-medium">
          Name <span className="font-normal text-slate">(optional)</span>
        </label>
        <input id={`${uid}-name`} name="name" autoComplete="name" className={input} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input
          ref={consentRef}
          type="checkbox"
          name="consent"
          className="mt-1 h-4 w-4 accent-gold"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
        />
        <span>I agree to be emailed about upcoming events and open days. *</span>
      </label>
      {errors.consent && (
        <p id={`${uid}-consent-err`} role="alert" className="text-sm text-error">
          {errors.consent}
        </p>
      )}
      <div aria-live="polite">{serverError && <p className="text-sm text-error">{serverError}</p>}</div>
      <Button type="submit" variant="primary" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Saving…" : "Notify me"}
      </Button>
    </form>
  );
}
