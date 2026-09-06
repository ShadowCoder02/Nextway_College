"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { PasswordPolicyChecklist } from "@/components/ui/PasswordPolicyChecklist";
import { Turnstile } from "@/components/ui/Turnstile";
import { applicantRegisterSchema, type ApplicantRegisterInput } from "@/lib/validation";
import { rememberProgrammeSlug, readRememberedProgrammeSlug } from "@/lib/applicant-programme";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";
import { TURNSTILE_AFTER_ATTEMPTS } from "@/lib/turnstile-constants";

type FieldErrors = Partial<Record<keyof ApplicantRegisterInput | "confirmPassword" | "general", string>>;

export default function ApplicantRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fieldRefs: Partial<Record<keyof FieldErrors, React.RefObject<HTMLInputElement | null>>> = {
    fullName: fullNameRef,
    email: emailRef,
    phone: phoneRef,
  };

  // Carries a programme picked on /apply?programme=<slug> through this page,
  // since it isn't tied to the account until after verification.
  const programmeSlug = searchParams.get("programme");

  useEffect(() => {
    if (programmeSlug) rememberProgrammeSlug(programmeSlug);
  }, [programmeSlug]);

  const confirmMismatch = confirmTouched && confirmPassword.length > 0 && password !== confirmPassword;

  function focusFirstInvalid(fieldErrors: FieldErrors) {
    const order: (keyof FieldErrors)[] = ["fullName", "email", "phone", "password", "confirmPassword"];
    for (const field of order) {
      if (fieldErrors[field] && fieldRefs[field]?.current) {
        fieldRefs[field]!.current!.focus();
        return;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setConfirmTouched(true);

    if (!isOnline) {
      setErrors({ general: "You appear to be offline. Your details have been kept — reconnect and try again." });
      return;
    }

    setLoading(true);

    const fd = new FormData(e.currentTarget);

    if (password !== confirmPassword) {
      // No focusFirstInvalid() call here: password/confirmPassword aren't in
      // fieldRefs (PasswordField doesn't forward a ref), so it would be a
      // no-op — the inline error text under the field is the feedback.
      setErrors({ confirmPassword: "Passwords do not match." });
      setLoading(false);
      return;
    }

    const payload = {
      fullName: (fd.get("fullName") as string) || "",
      email: (fd.get("email") as string) || "",
      phone: (fd.get("phone") as string) || "",
      password,
      agreeTerms: fd.get("agreeTerms") === "on",
    };

    const parsed = applicantRegisterSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ApplicantRegisterInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      focusFirstInvalid(fieldErrors);
      return;
    }

    try {
      const res = await apiFetch("/api/applicant/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors({ general: data.error || "Registration failed. Please try again." });
        setLoading(false);
        setFailedAttempts((n) => n + 1);
        return;
      }

      const otpQuery = data.debugOtp ? `&otp=${encodeURIComponent(data.debugOtp)}` : "";
      const rememberedSlug = programmeSlug || readRememberedProgrammeSlug();
      const programmeQuery = rememberedSlug ? `&programme=${encodeURIComponent(rememberedSlug)}` : "";
      router.push(`/apply/verify?email=${encodeURIComponent(parsed.data.email)}${otpQuery}${programmeQuery}`);
      router.refresh();
    } catch {
      setErrors({
        general: isOnline
          ? "Network error. Please check your connection and try again."
          : "You appear to be offline. Your details have been kept — reconnect and try again.",
      });
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <section className="section-padding bg-pearl min-h-[80vh] flex items-center justify-center">
      <div className="container-nwc max-w-xl">
        <div className="premium-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="eyebrow mb-2 block text-gold-text">Admissions Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Create Applicant Account</h1>
            <p className="mt-2 text-sm text-slate">
              Register below to start and manage your application for the 2026 intake.
            </p>
          </div>

          <div aria-live="polite">
            {!isOnline && (
              <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm font-medium text-navy">
                You appear to be offline. You can keep filling this in — it won&apos;t submit until you&apos;re back online.
              </div>
            )}
            {errors.general && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
                {errors.general}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                Full Name (as in NIC / Passport) *
              </label>
              <input
                ref={fullNameRef}
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Mohamed Rishan / Sarah Perera"
                required
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : "fullName-hint"}
                className={inputClass}
              />
              <p id="fullName-hint" className="mt-1 text-xs text-slate">Must match your NIC or Passport exactly.</p>
              {errors.fullName && (
                <p id="fullName-error" className="mt-1 text-xs text-error" role="alert">{errors.fullName}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Email Address *
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputClass}
                />
                {errors.email && <p id="email-error" className="mt-1 text-xs text-error" role="alert">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Mobile Phone *
                </label>
                <input
                  ref={phoneRef}
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="077 123 4567"
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                  className={inputClass}
                />
                <p id="phone-hint" className="mt-1 text-xs text-slate">Sri Lankan number, e.g. 077 123 4567.</p>
                {errors.phone && <p id="phone-error" className="mt-1 text-xs text-error" role="alert">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <PasswordField
                  id="password"
                  name="password"
                  label="Create Password *"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="Min. 8 chars (letters & numbers)"
                  required
                  error={errors.password}
                  showStrength
                />
                <PasswordPolicyChecklist password={password} />
              </div>

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password *"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setConfirmTouched(true);
                }}
                autoComplete="new-password"
                placeholder="Re-enter password"
                required
                error={errors.confirmPassword || (confirmMismatch ? "Passwords do not match." : undefined)}
              />
            </div>

            <label className="flex items-start gap-3 pt-2 text-xs text-slate">
              <input
                type="checkbox"
                name="agreeTerms"
                className="mt-0.5 h-4 w-4 rounded accent-gold"
                required
                aria-invalid={Boolean(errors.agreeTerms)}
                aria-describedby={errors.agreeTerms ? "agreeTerms-error" : undefined}
              />
              <span>
                I agree to the Nextway College International{" "}
                <Link href="/terms" target="_blank" className="text-navy font-semibold underline">
                  Terms of Admission
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-navy font-semibold underline">
                  Privacy Policy
                </Link>
                . *
              </span>
            </label>
            {errors.agreeTerms && <p id="agreeTerms-error" className="text-xs text-error" role="alert">{errors.agreeTerms}</p>}

            {failedAttempts >= TURNSTILE_AFTER_ATTEMPTS && <Turnstile onVerify={setTurnstileToken} />}

            <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account & Start Application"}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate/15 pt-6 text-center text-xs text-slate">
            Already have an applicant account?{" "}
            <Link href="/apply/login" className="font-bold text-navy hover:text-brand-red">
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
