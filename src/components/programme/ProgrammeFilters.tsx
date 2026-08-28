"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { PROGRAMME_LEVELS, STUDY_MODES } from "@/constants/site";

type ProgrammeFiltersProps = {
  schools: { slug: string; name: string }[];
};

export function ProgrammeFilters({ schools }: ProgrammeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = searchParams.get("q") ?? "";
  const level = searchParams.get("level") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const school = searchParams.get("school") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>, debounce = false) => {
      const apply = () => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
          if (value) params.set(key, value);
          else params.delete(key);
        });
        startTransition(() => {
          router.push(`/programmes?${params.toString()}`);
        });
      };

      if (debounce) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(apply, 350);
        return;
      }

      apply();
    },
    [router, searchParams],
  );

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <div className={`rounded-[var(--radius-card)] bg-ice p-6 ${isPending ? "opacity-70" : ""}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="search" className="mb-1 block text-sm font-medium">
            Search programmes
          </label>
          <input
            id="search"
            type="search"
            defaultValue={q}
            placeholder="Search by title, school..."
            className={inputClass}
            onChange={(e) => updateParams({ q: e.target.value }, true)}
          />
        </div>
        <div>
          <label htmlFor="level" className="mb-1 block text-sm font-medium">
            Level
          </label>
          <select
            id="level"
            value={level}
            className={inputClass}
            onChange={(e) => updateParams({ level: e.target.value })}
          >
            <option value="">All levels</option>
            {PROGRAMME_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mode" className="mb-1 block text-sm font-medium">
            Study mode
          </label>
          <select
            id="mode"
            value={mode}
            className={inputClass}
            onChange={(e) => updateParams({ mode: e.target.value })}
          >
            <option value="">All modes</option>
            {STUDY_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <label htmlFor="school" className="mb-1 block text-sm font-medium">
            School
          </label>
          <select
            id="school"
            value={school}
            className={inputClass}
            onChange={(e) => updateParams({ school: e.target.value })}
          >
            <option value="">All schools</option>
            {schools.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
