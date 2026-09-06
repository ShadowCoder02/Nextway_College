"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { readRememberedProgrammeSlug } from "@/lib/applicant-programme";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const defaultEmail = searchParams.get("email") || "";
  const defaultOtp = searchParams.get("otp") || "";
  const programmeSlug = searchParams.get("programme");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState(defaultOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isOnline) {
      setError("You appear to be offline. Please reconnect and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/applicant/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }

      setSuccess("Email verified successfully. Redirecting to your application...");
      const rememberedSlug = programmeSlug || readRememberedProgrammeSlug();
      const formHref = rememberedSlug
        ? `/apply/portal/form?programme=${encodeURIComponent(rememberedSlug)}`
        : "/apply/portal/form";
      setTimeout(() => {
        router.push(formHref);
        router.refresh();
      }, 1000);
    } catch {
      setError(isOnline ? "Network error. Please try again." : "You appear to be offline. Please reconnect and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    const res = await apiFetch("/api/applicant/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Unable to resend code.");
      return;
    }

    setSuccess(data.message || "A new verification code has been sent.");
  }

  return (
    <section className="section-padding bg-pearl min-h-[80vh] flex items-center justify-center">
      <div className="container-nwc max-w-lg">
        <div className="premium-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="eyebrow mb-2 block text-gold-text">Email Verification</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Verify Your Account</h1>
            <p className="mt-2 text-sm text-slate">
              Enter the 6-digit code sent to your email to activate your application account.
            </p>
          </div>

          <div aria-live="polite">
            {error && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error" role="alert">{error}</div>
            )}
            {success && (
              <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">{success}</div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div>
              <label htmlFor="otp" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">Verification Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                className="w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-semibold text-navy underline underline-offset-4 hover:text-brand-red"
            >
              Resend code
            </button>
            <Link href="/apply/register" className="text-sm font-semibold text-slate hover:text-brand-red">
              Back to registration
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
