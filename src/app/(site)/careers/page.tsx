import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/constants/site";
import { getCareers } from "@/services/careers";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = buildMetadata({
  title: "Careers",
  description: `Join ${SITE.name}. Explore current vacancies and build your career in education.`,
  path: "/careers",
});

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Grow with Nextway College International"
        description="We welcome passionate professionals to support students across our island-wide branch network."
      />

      <section className="section-padding">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Current vacancies"
            title="Open positions"
            description="Vacancies are updated by our management team. Apply via email with your CV and cover letter."
          />

          {careers.length === 0 ? (
            <EmptyState heading="No vacancies at the moment" body="Please check back soon, or send a speculative CV to our Admissions team." />
          ) : (
            <div className="grid gap-6">
              {careers.map((career) => (
                <article key={career.id} className="glass-panel p-8 fade-up">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow mb-2">{career.department}</p>
                      <h2 className="text-2xl font-bold text-navy">{career.title}</h2>
                    </div>
                    <span className="rounded-full bg-ice px-4 py-1.5 text-sm font-semibold text-navy">
                      {career.type}
                    </span>
                  </div>
                  <p className="mb-4 text-slate">
                    {career.location} · Posted {formatDate(career.postedAt)}
                  </p>
                  <p className="mb-6 text-charcoal leading-relaxed">{career.description}</p>
                  {career.requirements.length > 0 && (
                    <ul className="mb-6 space-y-2">
                      {career.requirements.map((req) => (
                        <li key={req} className="flex gap-2 text-sm text-charcoal">
                          <span className="font-bold text-brand-red">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Application: ${career.title}`)}`}
                    variant="primary"
                  >
                    Apply via Email
                  </Button>
                </article>
              ))}
            </div>
          )}

          <div className="mt-12 glass-panel p-8 text-center">
            <p className="mb-4 text-charcoal">
              Send general career enquiries to{" "}
              <Link href={`mailto:${SITE.email}`} className="font-semibold text-brand-red">
                {SITE.email}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
