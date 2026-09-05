"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { applicantRegisterSchema, type ApplicantRegisterInput } from "@/lib/validation";
import { rememberProgrammeSlug, readRememberedProgrammeSlug } from "@/lib/applicant-programme";
import { apiFetch } from "@/lib/api-fetch";

export default function ApplicantRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicantRegisterInput | "confirmPassword" | "general", string>>>({});

  // Carries a programme picked on /apply?programme=<slug> through this page,
  // since it isn't tied to the account until after verification.
  const programmeSlug = searchParams.get("programme");

  useEffect(() => {
    if (programmeSlug) rememberProgrammeSlug(programmeSlug);
  }, [programmeSlug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const password = (fd.get("password") as string) || "";
    const confirmPassword = (fd.get("confirmPassword") as string) || "";

    if (password !== confirmPassword) {
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
      const fieldErrors: Partial<Record<keyof ApplicantRegisterInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ApplicantRegisterInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/applicant/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors({ general: data.error || "Registration failed. Please try again." });
        setLoading(false);
        return;
      }

      const otpQuery = data.debugOtp ? `&otp=${encodeURIComponent(data.debugOtp)}` : "";
      const rememberedSlug = programmeSlug || readRememberedProgrammeSlug();
      const programmeQuery = rememberedSlug ? `&programme=${encodeURIComponent(rememberedSlug)}` : "";
      router.push(`/apply/verify?email=${encodeURIComponent(parsed.data.email)}${otpQuery}${programmeQuery}`);
      router.refresh();
    } catch {
      setErrors({ general: "Network error. Please check your connection and try again." });
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
            <span className="eyebrow mb-2 block text-gold">Admissions Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Create Applicant Account</h1>
            <p className="mt-2 text-sm text-slate">
              Register below to start and manage your application for the 2026 intake.
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                Full Name (as in NIC / Passport) *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Mohamed Rishan / Sarah Perera"
                required
                className={inputClass}
              />
              {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className={inputClass}
                />
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Mobile Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+94 7X XXX XXXX"
                  required
                  className={inputClass}
                />
                {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Create Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 chars (letters & numbers)"
                  required
                  className={inputClass}
                />
                {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  required
                  className={inputClass}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <label className="flex items-start gap-3 pt-2 text-xs text-slate">
              <input
                type="checkbox"
                name="agreeTerms"
                className="mt-0.5 h-4 w-4 rounded accent-gold"
                required
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
            {errors.agreeTerms && <p className="text-xs text-error">{errors.agreeTerms}</p>}

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
