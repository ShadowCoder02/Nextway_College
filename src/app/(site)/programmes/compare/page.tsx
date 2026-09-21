import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMetadata } from "@/lib/seo";
import { FACT_KEYS, FACT_LABELS, getProgrammeFacts, type ProgrammeFact } from "@/lib/programme-facts";
import { getProgrammes } from "@/services/programmes";
import type { Programme } from "@/types";
import { SITE } from "@/constants/site";

export const metadata = buildMetadata({
  title: "Compare programmes",
  description: "Compare Nextway College International programmes side by side.",
  path: "/programmes/compare",
  noindex: true,
});

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const MAX = 3;

function FactCell({ fact }: { fact: ProgrammeFact }) {
  if (fact.state === "provided") return <>{fact.value}</>;
  if (fact.state === "on-request") return <span className="text-slate">Contact Admissions — {SITE.phone}</span>;
  return <span className="text-slate">Not yet confirmed — ask Admissions</span>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const requested = (Array.isArray(raw.p) ? raw.p : raw.p ? [raw.p] : []).slice(0, 12);

  // Slugs are matched against the published programmes — anything else is
  // ignored, never echoed — then de-duplicated and capped at three.
  const published = await getProgrammes();
  const selected: Programme[] = [];
  for (const slug of requested) {
    const match = published.find((p) => p.slug === slug);
    if (match && !selected.includes(match)) selected.push(match);
    if (selected.length === MAX) break;
  }

  const rows: { label: string; render: (p: Programme) => React.ReactNode }[] = [
    { label: "School", render: (p) => p.schoolName },
    { label: "Level", render: (p) => p.level },
    ...FACT_KEYS.filter((k) => k !== "entryRequirements").map((k) => ({
      label: FACT_LABELS[k],
      render: (p: Programme) => <FactCell fact={getProgrammeFacts(p)[k]} />,
    })),
    {
      label: "Entry requirements",
      render: (p) =>
        p.entryRequirements.length ? (
          <ul className="list-disc space-y-1 pl-4 text-left">
            {p.entryRequirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <span className="text-slate">Not yet confirmed — ask Admissions</span>
        ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Programmes", href: "/programmes" }, { label: "Compare", href: "/programmes/compare" }]} />
      <PageHero eyebrow="Side by side" title="Compare programmes" description="Facts for each programme, in the same order, so differences are easy to spot." />

      <section className="py-12 lg:py-16">
        <div className="container-nwc">
          {selected.length < 2 ? (
            <EmptyState
              heading="Choose two or three programmes to compare"
              body="Go back to the programme list and tick “Compare” on the programmes you’d like to see side by side."
              action={<Button href="/programmes" variant="primary">Browse programmes</Button>}
            />
          ) : (
            <>
              <div
                className="overflow-x-auto rounded-[var(--radius-card)] border border-ice"
                role="region"
                aria-label="Programme comparison table, scrolls horizontally on small screens"
                tabIndex={0}
              >
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">Comparison of {selected.map((p) => p.title).join(", ")}</caption>
                  <thead>
                    <tr className="bg-ice align-bottom">
                      <td className="w-40 px-4 py-4" />
                      {selected.map((p) => (
                        <th key={p.id} scope="col" className="px-4 py-4 align-bottom font-heading text-lg font-semibold text-navy">
                          <Link href={`/programmes/${p.slug}`} className="hover:text-brand-red">
                            {p.title}
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className="border-t border-ice align-top">
                        <th scope="row" className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate">
                          {row.label}
                        </th>
                        {selected.map((p) => (
                          <td key={p.id} className="px-4 py-4 text-charcoal">
                            {row.render(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-ice">
                      <td />
                      {selected.map((p) => (
                        <td key={p.id} className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            <Button href={`/programmes/${p.slug}`} variant="outline" size="sm">
                              View programme
                            </Button>
                            <Button href={`/apply?programme=${p.slug}`} variant="primary" size="sm">
                              Apply
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-sm">
                <Link href="/programmes" className="font-bold text-brand-red underline underline-offset-2">
                  ← Back to all programmes
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
