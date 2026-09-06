"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { Turnstile } from "@/components/ui/Turnstile";
import { rememberProgrammeSlug } from "@/lib/applicant-programme";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";
import { TURNSTILE_AFTER_ATTEMPTS } from "@/lib/turnstile-constants";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  // A user can reach /apply/login straight from /apply?programme=<slug> via
  // "Sign In to Continue Application" — remember it so it still pre-selects
  // once they're on the application form.
  useEffect(() => {
    const programmeSlug = searchParams.get("programme");
    if (programmeSlug) rememberProgrammeSlug(programmeSlug);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string) || "";

    if (!email || !password) {
      setError("Please enter your email and password.");
      emailRef.current?.focus();
      return;
    }

    if (!isOnline) {
      setError("You appear to be offline. Please reconnect and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/applicant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        setFailedAttempts((n) => n + 1);
        emailRef.current?.focus();
        return;
      }

      router.push("/apply/portal");
      router.refresh();
    } catch {
      setError(isOnline ? "Network error. Please try again." : "You appear to be offline. Please reconnect and try again.");
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
            <span className="eyebrow mb-2 block text-gold-text">Admissions Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Applicant Sign In</h1>
            <p className="mt-2 text-sm text-slate">
              Access your application, upload documents, and track admission status.
            </p>
          </div>

          <div aria-live="polite">
            {!isOnline && (
              <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm font-medium text-navy">
                You appear to be offline. Reconnect to sign in.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="sr-only">Password</label>
              </div>
              <PasswordField
                id="password"
                name="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <div className="mt-1 text-right">
                <Link href="/apply/forgot-password" className="text-xs font-semibold text-navy hover:text-brand-red">
                  Forgot password?
                </Link>
              </div>
            </div>

            {failedAttempts >= TURNSTILE_AFTER_ATTEMPTS && <Turnstile onVerify={setTurnstileToken} />}

            <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Applicant Portal"}
            </Button>
          </form>

          <div className="mt-8 border-t border-slate/15 pt-6 text-center text-xs text-slate">
            Don&apos;t have an application account yet?{" "}
            <Link href="/apply/register" className="font-bold text-navy hover:text-brand-red">
              Start New Application →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
