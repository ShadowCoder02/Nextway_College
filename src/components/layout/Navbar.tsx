"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/constants/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const routes = new Set([...NAV_LINKS.map((link) => link.href), "/admissions"]);
    routes.forEach((route) => router.prefetch(route));
  }, [router]);

  // Focus trap + Escape-to-close while the mobile menu is open.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const firstLink = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstLink?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleButtonRef.current?.focus();
        return;
      }

      if (e.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav shadow-sm" : "bg-white border-b border-navy/5",
      )}
    >
      <div className="container-nwc flex h-[var(--header-height)] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-brand-red"
                    : "text-charcoal hover:text-navy",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-red" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/apply" variant="primary" size="sm">
            Apply Online
          </Button>
        </div>

        <button
          ref={toggleButtonRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/10 bg-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-nav-panel" ref={panelRef} className="border-t border-navy/5 bg-white lg:hidden">
          <nav className="container-nwc flex flex-col gap-1 py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3.5 font-medium hover:bg-ice"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-ice pt-4">
              <Button href="/apply" variant="primary" className="w-full">
                Apply Online
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
