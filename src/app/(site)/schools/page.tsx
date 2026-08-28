import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
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
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc">
          <span className="eyebrow mb-3 block">Academic structure</span>
          <h1 className="text-display text-white">Our Schools</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Programmes are organised across specialist schools to help you find the right field of study.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc space-y-16">
          {programmesBySchool.map(({ school, programmes }) => (
            <article key={school.id} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative aspect-16/10 overflow-hidden rounded-[var(--radius-card)]">
                <Image
                  src={school.imageUrl}
                  alt={school.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <SectionHeader title={school.name} description={school.description} />
                <ul className="mb-6 space-y-2">
                  {programmes.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/programmes/${p.slug}`}
                        className="font-medium text-deep-blue hover:text-gold"
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
          ))}
        </div>
      </section>
    </>
  );
}
