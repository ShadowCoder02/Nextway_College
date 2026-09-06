"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { PROGRAMME_LEVELS, STUDY_MODES } from "@/constants/site";

type ProgrammeFiltersProps = {
  schools: { slug: string; name: string; programmeCount: number }[];
  levelCounts: Record<string, number>;
  modeCounts: Record<string, number>;
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Featured" },
  { value: "title-asc", label: "Name (A–Z)" },
  { value: "title-desc", label: "Name (Z–A)" },
];

export function ProgrammeFilters({ schools, levelCounts, modeCounts }: ProgrammeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const q = searchParams.get("q") ?? "";
  const level = searchParams.get("level") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const school = searchParams.get("school") ?? "";
  const sort = searchParams.get("sort") ?? "";

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

  function clearAll() {
    if (searchInputRef.current) searchInputRef.current.value = "";
    startTransition(() => {
      router.push("/programmes");
    });
  }

  const schoolName = schools.find((s) => s.slug === school)?.name;

  const activeFilters: { key: string; label: string }[] = [
    q ? { key: "q", label: `Search: "${q}"` } : null,
    level ? { key: "level", label: level } : null,
    mode ? { key: "mode", label: mode } : null,
    school ? { key: "school", label: schoolName ?? school } : null,
  ].filter((f): f is { key: string; label: string } => f !== null);

  const hasActiveFilters = activeFilters.length > 0;

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <div className={`rounded-[var(--radius-card)] bg-ice p-6 ${isPending ? "opacity-70" : ""}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label htmlFor="search" className="mb-1 block text-sm font-medium">
            Search programmes
          </label>
          <input
            ref={searchInputRef}
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
            {PROGRAMME_LEVELS.map((l) => {
              const count = levelCounts[l] ?? 0;
              return (
                <option key={l} value={l} disabled={count === 0}>
                  {l} ({count})
                </option>
              );
            })}
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
            {STUDY_MODES.map((m) => {
              const count = modeCounts[m] ?? 0;
              return (
                <option key={m} value={m} disabled={count === 0}>
                  {m} ({count})
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mb-1 block text-sm font-medium">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            className={inputClass}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-5">
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
            {schools
              // Keep the currently-selected school even at zero count, so a
              // shared/bookmarked ?school=<zero-count-slug> URL still has a
              // matching <option> instead of leaving the <select> orphaned.
              .filter((s) => s.programmeCount > 0 || s.slug === school)
              .map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.programmeCount})
                </option>
              ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate/15 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate">Active filters:</span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => updateParams({ [filter.key]: "" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate/30 bg-white px-3 py-1 text-xs font-medium text-charcoal transition hover:border-brand-red hover:text-brand-red"
            >
              {filter.label}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove filter: {filter.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-xs font-bold text-brand-red underline underline-offset-2 hover:text-brand-red/80"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
