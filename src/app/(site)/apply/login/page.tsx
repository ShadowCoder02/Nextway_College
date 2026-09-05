"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ApplicantLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string) || "";
    const password = (fd.get("password") as string) || "";

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/applicant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/apply/portal");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
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
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Applicant Sign In</h1>
            <p className="mt-2 text-sm text-slate">
              Access your application, upload documents, and track admission status.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

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
