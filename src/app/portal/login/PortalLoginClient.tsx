"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { apiFetch } from "@/lib/api-fetch";

export function PortalLoginClient() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      username: fd.get("username"),
      password: fd.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials");
      setLoading(false);
      return;
    }

    const res = await apiFetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (res.ok) {
      router.push("/portal");
      router.refresh();
      return;
    }

    setError("Invalid username or password");
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-deep-blue to-navy px-4">
      <div className="mesh-overlay absolute inset-0 opacity-30" />
      <div className="glass-panel relative w-full max-w-md p-8">
        <div className="mb-8 flex justify-center">
          <Logo variant="admin" />
        </div>
        <h1 className="mb-1 text-center text-2xl font-bold text-navy">Management Portal</h1>
        <p className="mb-8 text-center text-sm text-slate">
          Sign in to manage programmes, news, events, careers and enquiries
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue="nextway college"
              required
              className="input-premium"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-premium"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
