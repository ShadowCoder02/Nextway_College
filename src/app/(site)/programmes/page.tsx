import { Suspense } from "react";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgrammeFilters } from "@/components/programme/ProgrammeFilters";
import { ProgrammesEmptyState } from "@/components/programme/ProgrammesEmptyState";
import { parseProgrammeFilters } from "@/lib/programmes";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getProgrammes, getSchoolsWithProgrammeCounts, getProgrammeFacetCounts } from "@/services/programmes";

export const metadata = buildMetadata({
  title: "Programmes",
  description:
    "Browse diploma, higher diploma and degree programmes at Nextway College International in Kandy.",
  path: "/programmes",
});

type PageProps = {
  searchParams: Promise<{ q?: string; level?: string; mode?: string; school?: string; sort?: string }>;
};

export default async function ProgrammesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProgrammeFilters(params);
  const [programmes, schools, facets] = await Promise.all([
    getProgrammes(filters),
    getSchoolsWithProgrammeCounts(),
    getProgrammeFacetCounts(),
  ]);

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
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-ice" />}>
            <ProgrammeFilters
              schools={schools.map((s) => ({ slug: s.slug, name: s.name, programmeCount: s.programmeCount }))}
              levelCounts={facets.levels}
              modeCounts={facets.modes}
            />
          </Suspense>

          <SectionHeader
            title={`${programmes.length} programme${programmes.length !== 1 ? "s" : ""} found`}
            description="Use filters to narrow by level, mode or school."
          />

          {programmes.length === 0 ? (
            <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-ice" />}>
              <ProgrammesEmptyState schools={schools.map((s) => ({ slug: s.slug, name: s.name }))} />
            </Suspense>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {programmes.map((p) => (
                <ProgrammeCard key={p.id} programme={p} featured={p.featured} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
