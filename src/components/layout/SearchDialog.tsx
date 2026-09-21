"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type SchoolLink = { slug: string; name: string };

/** "Search programmes" entry point: a header button that opens a small modal
 * with a search box (a plain GET form to /programmes, so it also works
 * without JS once open) and quick links by school. */
export function SearchDialog({ schools, className, labelClassName }: { schools: SchoolLink[]; className?: string; labelClassName?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(open, panelRef, { onEscape: () => setOpen(false), returnTo: triggerRef, initialFocus: inputRef });

  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          className ??
          "inline-flex h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-medium text-navy transition hover:border-brand-red hover:text-brand-red"
        }
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" aria-hidden="true" />
        <span className={labelClassName ?? "hidden xl:inline"}>Search programmes</span>
        <span className={labelClassName ? "sr-only" : "sr-only xl:hidden"}>Search programmes</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-navy/60 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-dialog-title"
            className="w-full max-w-xl rounded-[var(--radius-card)] bg-white p-6 shadow-premium sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="search-dialog-title" className="font-heading text-xl font-semibold text-navy">
                Search programmes
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-navy transition hover:bg-ice"
                aria-label="Close search"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <form
              action="/programmes"
              method="get"
              role="search"
              onSubmit={(e) => {
                // Navigate explicitly, then close: unmounting the form inside
                // its own submit event cancels the native GET navigation.
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
                setOpen(false);
                router.push(q ? `/programmes?q=${encodeURIComponent(q)}` : "/programmes");
              }}
            >
              <label htmlFor="site-search" className="mb-1 block text-sm font-medium">
                Programme, subject or school
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="site-search"
                  name="q"
                  type="search"
                  maxLength={80}
                  autoComplete="off"
                  placeholder="e.g. Information Technology, Law…"
                  className="min-w-0 flex-1 rounded-lg border border-slate/30 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-red px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate">Or browse by school</p>
              <ul className="flex flex-wrap gap-2">
                {schools.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/programmes?school=${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="inline-block rounded-full border border-slate/25 px-3 py-1.5 text-sm text-charcoal transition hover:border-brand-red hover:text-brand-red"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/programmes"
                onClick={() => setOpen(false)}
                className="mt-5 inline-block text-sm font-bold text-brand-red underline underline-offset-2"
              >
                View all programmes →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
