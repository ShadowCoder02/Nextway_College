import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { programmesHref } from "@/lib/programmes";
import type { ProgrammeFilters } from "@/services/programmes";

/** Server-rendered "nothing matches" state. Everything shown comes from the
 * validated filter object, never the raw query string. */
export function ProgrammesEmptyState({ filters, schools }: { filters: ProgrammeFilters; schools: { slug: string; name: string }[] }) {
  const schoolName = schools.find((s) => s.slug === filters.school)?.name;
  const labels: { key: keyof ProgrammeFilters; label: string }[] = [];
  if (filters.q) labels.push({ key: "q", label: `Search: “${filters.q}”` });
  if (filters.level) labels.push({ key: "level", label: filters.level });
  if (filters.mode) labels.push({ key: "mode", label: filters.mode });
  if (filters.medium) labels.push({ key: "medium", label: `${filters.medium} medium` });
  if (filters.intake) labels.push({ key: "intake", label: filters.intake });
  if (filters.school) labels.push({ key: "school", label: schoolName ?? filters.school });

  return (
    <EmptyState
      heading="No programmes match your filters"
      body={
        labels.length > 0 ? (
          <div>
            <p className="mb-3">Currently filtering by:</p>
            <ul className="mb-1 flex flex-wrap justify-center gap-2">
              {labels.map((l) => (
                <li key={l.key}>
                  <Link
                    href={programmesHref(filters, l.key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate/30 bg-white px-3 py-1 text-xs font-medium text-charcoal transition hover:border-brand-red hover:text-brand-red"
                  >
                    {l.label}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          "Try adjusting your search."
        )
      }
      action={
        <Link href="/programmes" className="text-sm font-bold text-brand-red underline underline-offset-2 hover:text-brand-red/80">
          Clear all filters
        </Link>
      }
    />
  );
}
