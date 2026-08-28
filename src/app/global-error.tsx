"use client";

import Link from "next/link";
import { useEffect } from "react";

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
      <body className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4 font-sans text-[#1e293b]">
        <div className="max-w-md rounded-2xl border border-[#0f2340]/10 bg-white p-8 text-center shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-[#0f2340]">Something went wrong</h1>
          <p className="mb-6 text-sm text-[#64748b]">
            The page could not load. This is usually fixed by refreshing or restarting the dev server.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-[#c41e3a] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-[#0f2340]/20 px-6 py-2.5 text-sm font-semibold text-[#0f2340]"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
