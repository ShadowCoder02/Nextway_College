import { Suspense } from "react";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProgrammeFilters } from "@/components/programme/ProgrammeFilters";
import { parseProgrammeFilters } from "@/lib/programmes";
import { PageHero } from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { getProgrammes, getSchools } from "@/services/programmes";

export const metadata = buildMetadata({
  title: "Programmes",
  description:
    "Browse diploma, higher diploma and degree programmes at Nextway College International in Kandy.",
  path: "/programmes",
});

type PageProps = {
  searchParams: Promise<{ q?: string; level?: string; mode?: string; school?: string }>;
};

export default async function ProgrammesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProgrammeFilters(params);
  const [programmes, schools] = await Promise.all([
    getProgrammes(filters),
    getSchools(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Academic Catalogue"
        title="Programmes"
        description="Discover career-focused pathways across computing, business, language and hospitality."
      />

      <section className="py-12 lg:py-16">
        <div className="container-nwc space-y-8">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-ice" />}>
            <ProgrammeFilters schools={schools.map((s) => ({ slug: s.slug, name: s.name }))} />
          </Suspense>

          <SectionHeader
            title={`${programmes.length} programme${programmes.length !== 1 ? "s" : ""} found`}
            description="Use filters to narrow by level, mode or school."
          />

          {programmes.length === 0 ? (
            <p className="rounded-[var(--radius-card)] bg-ice p-8 text-center text-slate">
              No programmes match your filters. Try adjusting your search.
            </p>
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
