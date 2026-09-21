import Form from "next/form";
import Link from "next/link";
import { PROGRAMME_LEVELS, STUDY_MODES } from "@/constants/site";
import { MEDIUM_FILTERS, programmesHref } from "@/lib/programmes";
import type { ProgrammeFilters as Filters } from "@/services/programmes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ProgrammeFiltersProps = {
  /** Already validated against the enums (see parseProgrammeFilters) — this
   * component never reads the raw URL. */
  filters: Filters;
  schools: { slug: string; name: string; programmeCount: number }[];
  facets: { levels: Record<string, number>; modes: Record<string, number>; mediums: Record<string, number>; intakes: Record<string, number> };
};

const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "title-asc", label: "Name (A–Z)" },
  { value: "title-desc", label: "Name (Z–A)" },
];

const control =
  "w-full rounded-lg border border-slate/80 bg-white px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

function Select({
  id,
  label,
  value,
  children,
}: {
  id: string;
  label: string;
  value: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select id={id} name={id} defaultValue={value ?? ""} className={control}>
        {children}
      </select>
    </div>
  );
}

const optionDisabled = (count: number | undefined, selected: boolean) => (count ?? 0) === 0 && !selected;

/** Server-rendered GET form: works with no JavaScript (press "Apply
 * filters"), and `next/form` upgrades it to client-side navigation when JS is
 * available. Deliberately no auto-submit on change — arrowing through a
 * <select> with the keyboard would otherwise reload the results on every
 * keypress (WCAG 3.2.2). */
export function ProgrammeFilters({ filters, schools, facets }: ProgrammeFiltersProps) {
  const schoolName = schools.find((s) => s.slug === filters.school)?.name;
  const chips: { key: keyof Filters; label: string }[] = (
    [
      filters.q ? { key: "q", label: `Search: “${filters.q}”` } : null,
      filters.level ? { key: "level", label: filters.level } : null,
      filters.mode ? { key: "mode", label: filters.mode } : null,
      filters.medium ? { key: "medium", label: `${filters.medium} medium` } : null,
      filters.intake ? { key: "intake", label: filters.intake } : null,
      filters.school ? { key: "school", label: schoolName ?? filters.school } : null,
    ] as ({ key: keyof Filters; label: string } | null)[]
  ).filter((c): c is { key: keyof Filters; label: string } => c !== null);

  return (
    <Card>
      <Form action="/programmes" role="search" aria-label="Filter programmes">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="md:col-span-2 lg:col-span-6">
            <label htmlFor="q" className="mb-1 block text-sm font-medium">
              Search programmes
            </label>
            <input
              id="q"
              name="q"
              type="search"
              maxLength={80}
              defaultValue={filters.q ?? ""}
              placeholder="Search by title, school…"
              className={control}
            />
          </div>

          <div className="lg:col-span-2">
            <Select id="level" label="Level" value={filters.level}>
              <option value="">All levels</option>
              {PROGRAMME_LEVELS.map((l) => (
                <option key={l} value={l} disabled={optionDisabled(facets.levels[l], l === filters.level)}>
                  {l} ({facets.levels[l] ?? 0})
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select id="school" label="School" value={filters.school}>
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.slug} value={s.slug} disabled={optionDisabled(s.programmeCount, s.slug === filters.school)}>
                  {s.name} ({s.programmeCount})
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select id="mode" label="Study mode" value={filters.mode}>
              <option value="">All modes</option>
              {STUDY_MODES.map((m) => (
                <option key={m} value={m} disabled={optionDisabled(facets.modes[m], m === filters.mode)}>
                  {m} ({facets.modes[m] ?? 0})
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select id="medium" label="Language of instruction" value={filters.medium}>
              <option value="">Any language</option>
              {MEDIUM_FILTERS.map((m) => (
                <option key={m} value={m} disabled={optionDisabled(facets.mediums[m], m === filters.medium)}>
                  {m} ({facets.mediums[m] ?? 0})
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select id="intake" label="Intake" value={filters.intake}>
              <option value="">Any intake</option>
              {Object.keys(facets.intakes)
                .sort()
                .map((i) => (
                  <option key={i} value={i}>
                    {i} ({facets.intakes[i]})
                  </option>
                ))}
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select id="sort" label="Sort by" value={filters.sort}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Button type="submit" variant="primary" size="sm">
            Apply filters
          </Button>
          {chips.length > 0 && (
            <Link href="/programmes" className="text-sm font-bold text-brand-red underline underline-offset-2 hover:text-brand-red/80">
              Clear all
            </Link>
          )}
        </div>
      </Form>

      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate/15 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate">Active filters:</span>
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={programmesHref(filters, chip.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate/30 bg-white px-3 py-1 text-xs font-medium text-charcoal transition hover:border-brand-red hover:text-brand-red"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove filter: {chip.label}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
