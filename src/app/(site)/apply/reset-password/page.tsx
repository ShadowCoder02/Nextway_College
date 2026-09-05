"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { PasswordPolicyChecklist } from "@/components/ui/PasswordPolicyChecklist";
import { resetPasswordSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/api-fetch";
import { useOnlineStatus } from "@/lib/use-online-status";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const confirmMismatch = confirmTouched && confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setConfirmTouched(true);

    if (!token) {
      setError("This reset link is missing its token. Please use the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please choose a stronger password.");
      return;
    }

    if (!isOnline) {
      setError("You appear to be offline. Please reconnect and try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/applicant/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Unable to reset your password. The link may have expired.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/apply/login"), 2500);
    } catch {
      setError(isOnline ? "Network error. Please try again." : "You appear to be offline. Please reconnect and try again.");
      setLoading(false);
    }
  }

  return (
    <section className="section-padding bg-pearl min-h-[80vh] flex items-center justify-center">
      <div className="container-nwc max-w-md">
        <div className="premium-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="eyebrow mb-2 block text-gold">Admissions Portal</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Reset Password</h1>
            <p className="mt-2 text-sm text-slate">Choose a new password for your applicant account.</p>
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
            {success && (
              <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">
                Password reset successfully. Redirecting you to sign in...
              </div>
            )}
          </div>

          {!token && !success && (
            <p className="mb-6 text-sm text-error">
              This link is missing a reset token. Please use the link from your password reset email, or{" "}
              <Link href="/apply/forgot-password" className="font-semibold underline">request a new one</Link>.
            </p>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <PasswordField
                  id="password"
                  name="password"
                  label="New Password *"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="Min. 8 chars (letters & numbers)"
                  required
                  showStrength
                />
                <PasswordPolicyChecklist password={password} />
              </div>

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password *"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  setConfirmTouched(true);
                }}
                autoComplete="new-password"
                placeholder="Re-enter password"
                required
                error={confirmMismatch ? "Passwords do not match." : undefined}
              />

              <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading || !token}>
                {loading ? "Resetting..." : "Reset Password"}
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
