"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProgrammeSearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/programmes?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md gap-2" role="search">
      <label htmlFor="programme-search" className="sr-only">
        Search programmes
      </label>
      <input
        id="programme-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search programmes, e.g. Information Technology"
        className="w-full rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy/90"
      >
        Search
      </button>
    </form>
  );
}
