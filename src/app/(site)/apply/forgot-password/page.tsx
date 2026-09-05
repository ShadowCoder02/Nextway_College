"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { forgotPasswordSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";

export default function ForgotPasswordPage() {
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string) || "";

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!isOnline) {
      setError("You appear to be offline. Please reconnect and try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/applicant/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      // Always show the same neutral message the API returns, regardless of
      // whether the account exists — never let the UI branch on that.
      setMessage(data.message || "If that email is registered, we've sent instructions to reset your password.");
      if (data.debugToken) {
        console.info("[dev only] Password reset token:", data.debugToken, `-> /apply/reset-password?token=${data.debugToken}`);
      }
    } catch {
      setError(isOnline ? "Network error. Please try again." : "You appear to be offline. Please reconnect and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-3 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <section className="section-padding bg-pearl min-h-[80vh] flex items-center justify-center">
      <div className="container-nwc max-w-md">
        <div className="premium-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="eyebrow mb-2 block text-gold">Admissions Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Forgot Password</h1>
            <p className="mt-2 text-sm text-slate">
              Enter your account email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div aria-live="polite">
            {!isOnline && (
              <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm font-medium text-navy">
                You appear to be offline. Reconnect to continue.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">
                {message}
              </div>
            )}
          </div>

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(error)}
                  className={inputClass}
                  placeholder="name@example.com"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="mt-8 border-t border-slate/15 pt-6 text-center text-xs text-slate">
            <Link href="/apply/login" className="font-bold text-navy hover:text-brand-red">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
