"use client";

import Link from "next/link";
import { useEffect } from "react";
import "@/styles/globals.css";

// Deliberately not importing SITE here: constants/site.ts throws at import
// time if NEXT_PUBLIC_SITE_URL is missing in production, and this is the
// last line of defense shown when *something else* has already thrown —
// it must not have any import that can itself fail to render.
const SUPPORT_PHONE = "0812 201 650";
const SUPPORT_PHONE_TEL = "+94812201650";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-ice px-4 font-sans text-charcoal antialiased">
        <div className="max-w-md rounded-[var(--radius-card)] border border-navy/10 bg-white p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="eyebrow mb-3">500</p>
          <h1 className="mb-2 text-2xl font-bold text-navy">Something went wrong on our end</h1>
          <p className="mb-6 text-sm text-slate">
            We&apos;re sorry for the inconvenience. Please try again — if the problem continues,
            our Admissions team can help you directly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red/90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-bold text-navy transition hover:border-navy/40"
            >
              Go home
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate">
            Or call Admissions at{" "}
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold text-brand-red hover:underline">
              {SUPPORT_PHONE}
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
