import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { getSchools, getProgrammesBySchool } from "@/services/programmes";

export const metadata = buildMetadata({
  title: "Schools",
  description: "Explore academic schools at Nextway College International.",
  path: "/schools",
});

export default async function SchoolsPage() {
  const schools = await getSchools();
  const programmesBySchool = await Promise.all(
    schools.map(async (school) => ({
      school,
      programmes: await getProgrammesBySchool(school.slug),
    })),
  );

  return (
    <>
      <Breadcrumbs items={[{ label: "Schools", href: "/schools" }]} />
      <PageHero
        eyebrow="Academic structure"
        title="Our Schools"
        description="Programmes are organised across specialist schools to help you find the right field of study."
      />

      <section className="py-16 lg:py-24">
        <div className="container-nwc space-y-16">
          {programmesBySchool.map(({ school, programmes }) => (
            <Reveal key={school.id}>
            <article className="group grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-16/10 overflow-hidden rounded-[var(--radius-card)]">
                <Image
                  src={school.imageUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
              </div>
              <div>
                <SectionHeader title={school.name} description={school.description} />
                <ul className="mb-6 space-y-2">
                  {programmes.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/programmes/${p.slug}`}
                        className="font-medium text-deep-blue hover:text-gold-text"
                      >
                        {p.title}
                      </Link>
                      <span className="ml-2 text-sm text-slate">({p.level})</span>
                    </li>
                  ))}
                </ul>
                <Button href={`/programmes?school=${school.slug}`} variant="secondary">
                  View school programmes
                </Button>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
