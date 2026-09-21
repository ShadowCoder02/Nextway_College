import Form from "next/form";
import { redirect } from "next/navigation";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgrammeFilters } from "@/components/programme/ProgrammeFilters";
import { ProgrammesEmptyState } from "@/components/programme/ProgrammesEmptyState";
import { CompareBar } from "@/components/programme/CompareBar";
import { parseProgrammeFilters, programmesHref } from "@/lib/programmes";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getProgrammes, getSchoolsWithProgrammeCounts, getProgrammeFacetCounts } from "@/services/programmes";

type RawParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<RawParams> };

const FILTER_KEYS = ["q", "level", "mode", "medium", "school", "intake", "sort"];

export async function generateMetadata({ searchParams }: PageProps) {
  const raw = await searchParams;
  // Filtered views are thin duplicates of /programmes — keep them out of the
  // index (the unfiltered page is the canonical, indexable one).
  const filtered = FILTER_KEYS.some((k) => raw[k] !== undefined);
  return buildMetadata({
    title: "Programmes",
    description: "Browse diploma, higher diploma and degree programmes at Nextway College International in Kandy.",
    path: "/programmes",
    noindex: filtered,
  });
}

export default async function ProgrammesPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const [schools, facets] = await Promise.all([getSchoolsWithProgrammeCounts(), getProgrammeFacetCounts()]);

  // Every query parameter is checked against a fixed list; an unknown value
  // redirects to the clean URL instead of being echoed into the page.
  const { filters, hadInvalid } = parseProgrammeFilters(raw, {
    schools: schools.map((s) => s.slug),
    intakes: Object.keys(facets.intakes),
  });
  if (hadInvalid) redirect(programmesHref(filters));

  const programmes = await getProgrammes(filters);

  return (
    <>
      <Breadcrumbs items={[{ label: "Programmes", href: "/programmes" }]} />
      <PageHero
        eyebrow="Academic Catalogue"
        title="Programmes"
        description="Discover career-focused pathways across computing, law, education, social sciences and language & communication."
      />

      <section className="py-12 lg:py-16">
        <div className="container-nwc space-y-8">
          <ProgrammeFilters
            filters={filters}
            schools={schools.map((s) => ({ slug: s.slug, name: s.name, programmeCount: s.programmeCount }))}
            facets={facets}
          />

          <div id="results" className="scroll-mt-28">
            <SectionHeader
              className="mb-6"
              title={`${programmes.length} programme${programmes.length !== 1 ? "s" : ""} found`}
              description="Use the filters above to narrow by level, school, mode, language or intake."
            />
            <p role="status" className="sr-only">
              {programmes.length} programme{programmes.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {programmes.length === 0 ? (
            <ProgrammesEmptyState filters={filters} schools={schools.map((s) => ({ slug: s.slug, name: s.name }))} />
          ) : (
            <Form id="compare-form" action="/programmes/compare" aria-label="Compare programmes">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programmes.map((p) => (
                  <ProgrammeCard key={p.id} programme={p} featured={p.featured} comparable />
                ))}
              </div>
              <CompareBar formId="compare-form" />
            </Form>
          )}
        </div>
      </section>
    </>
  );
}
