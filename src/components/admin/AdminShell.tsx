"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { PORTAL_NAV } from "@/constants/site";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await apiFetch("/api/portal/logout", { method: "POST" });
    try {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    } catch {
      // ignore
    }
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ice lg:flex">
      <aside className="border-b border-navy/10 bg-navy text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/" className="mb-3 inline-block">
            <Logo variant="admin" />
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Management Portal</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-full border border-white/20 px-3 py-2 text-xs hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col">
          {PORTAL_NAV.map((item) => {
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition",
                  active ? "bg-brand-red text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← View public site
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="container-nwc py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
