import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { LeadForm } from "@/components/ui/LeadForm";
import { Badge } from "@/components/ui/Badge";
import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { IMAGES, HERO_BLUR_PLACEHOLDER } from "@/constants/images";
import { SITE } from "@/constants/site";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getProgrammeBySlug } from "@/services/programmes";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { getStoredProgrammes } = await import("@/lib/cms/store");
  const programmes = await getStoredProgrammes();
  return programmes.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const programme = await getProgrammeBySlug(slug);
  if (!programme) return {};
  return buildMetadata({
    title: programme.seoTitle ?? programme.title,
    description: programme.seoDescription ?? programme.shortPitch,
    path: `/programmes/${programme.slug}`,
    image: programme.imageUrl,
  });
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const programme = await getProgrammeBySlug(slug);
  if (!programme) notFound();

  const modulesByYear = programme.modules.reduce<Record<string, typeof programme.modules>>(
    (acc, mod) => {
      (acc[mod.yearOrStage] ??= []).push(mod);
      return acc;
    },
    {},
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            courseJsonLd({
              title: programme.title,
              description: programme.overview,
              slug: programme.slug,
              duration: programme.duration,
              level: programme.level,
              mode: programme.mode,
            }),
          ),
        }}
      />

      {/* Hero */}
      <section className="relative bg-navy text-white">
        <div className="absolute inset-0 opacity-25">
          <FallbackImage
            src={programme.imageUrl}
            fallbackSrc={IMAGES.hero}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={HERO_BLUR_PLACEHOLDER}
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/80 to-navy/60" />
        <div className="container-nwc relative py-16 lg:py-24">
          <Breadcrumbs
            items={[{ label: "Programmes", href: "/programmes" }, { label: programme.title, href: `/programmes/${programme.slug}` }]}
            visible
            className="mb-4 [&_ol]:text-white/70 [&_a:hover]:text-gold [&_span]:text-white"
          />
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="gold">{programme.level}</Badge>
            {programme.flagship && <Badge>Flagship</Badge>}
          </div>
          <h1 className="text-display mb-4 text-white">{programme.title}</h1>
          <p className="mb-6 max-w-2xl text-lg text-white/85">{programme.shortPitch}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span>{programme.duration}</span>
            <span>·</span>
            <span>{programme.mode}</span>
            <span>·</span>
            <span>{programme.location}</span>
            <span>·</span>
            <span>{programme.intake}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`/apply?programme=${programme.slug}`} variant="primary">
              Apply Online
            </Button>
            <Button href="#enquire" variant="outline-light">
              Request information
            </Button>
          </div>
        </div>
      </section>

      <div className="container-nwc py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-section mb-4">Overview</h2>
              <div className="gold-rule mb-4" />
              <p className="text-lg text-charcoal">{programme.overview}</p>
            </section>

            <section>
              <h2 className="text-section mb-4">Why this programme</h2>
              <div className="gold-rule mb-4" />
              <p className="text-charcoal">{programme.whyThisProgramme}</p>
            </section>

            {programme.learningOutcomes.length > 0 && (
              <section>
                <h2 className="text-section mb-4">Learning outcomes</h2>
                <div className="gold-rule mb-4" />
                <ul className="space-y-3">
                  {programme.learningOutcomes.map((o) => (
                    <li key={o} className="flex gap-3">
                      <span className="mt-1 text-gold" aria-hidden="true">✓</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {programme.modules.length > 0 && (
              <section>
                <h2 className="text-section mb-4">Curriculum</h2>
                <div className="gold-rule mb-4" />
                {Object.entries(modulesByYear).map(([year, mods]) => (
                  <div key={year} className="mb-8">
                    <h3 className="mb-4 text-xl font-bold text-deep-blue">{year}</h3>
                    <div className="overflow-hidden rounded-[var(--radius-card)] border border-ice">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-ice">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Code</th>
                            <th className="px-4 py-3 font-semibold">Module</th>
                            {mods.some((m) => m.credits) && (
                              <th className="px-4 py-3 font-semibold">Credits</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {mods.map((mod) => (
                            <tr key={mod.id} className="border-t border-ice">
                              <td className="px-4 py-3 font-mono text-deep-blue">{mod.code}</td>
                              <td className="px-4 py-3">{mod.title}</td>
                              {mods.some((m) => m.credits) && (
                                <td className="px-4 py-3">{mod.credits ?? "—"}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {programme.entryRequirements.length > 0 && (
              <section>
                <h2 className="text-section mb-4">Entry requirements</h2>
                <div className="gold-rule mb-4" />
                <ul className="list-disc space-y-2 pl-5">
                  {programme.entryRequirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>
            )}

            {programme.careerOpportunities.length > 0 && (
              <section>
                <h2 className="text-section mb-4">Career opportunities</h2>
                <div className="gold-rule mb-4" />
                <ul className="grid gap-3 sm:grid-cols-2">
                  {programme.careerOpportunities.map((c) => (
                    <li key={c} className="rounded-lg bg-ice px-4 py-3">{c}</li>
                  ))}
                </ul>
              </section>
            )}

            {programme.faqs.length > 0 && (
              <section>
                <h2 className="text-section mb-4">FAQs</h2>
                <div className="gold-rule mb-4" />
                <div className="space-y-4">
                  {programme.faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="rounded-[var(--radius-card)] border border-ice p-4"
                    >
                      <summary className="cursor-pointer font-semibold text-navy">
                        {faq.question}
                      </summary>
                      <p className="mt-3 text-slate">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-[var(--radius-card)] bg-ice p-6">
                <h3 className="mb-4 font-bold text-navy">Programme details</h3>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-slate">School</dt><dd className="font-medium">{programme.schoolName}</dd></div>
                  <div><dt className="text-slate">Level</dt><dd className="font-medium">{programme.level}</dd></div>
                  <div><dt className="text-slate">Duration</dt><dd className="font-medium">{programme.duration}</dd></div>
                  <div><dt className="text-slate">Mode</dt><dd className="font-medium">{programme.mode}</dd></div>
                  <div><dt className="text-slate">Medium</dt><dd className="font-medium">{programme.medium}</dd></div>
                  <div><dt className="text-slate">Intake</dt><dd className="font-medium">{programme.intake}</dd></div>
                  <div>
                    <dt className="text-slate">Application deadline</dt>
                    <dd className="font-medium">{programme.applicationDeadline || "To be announced — contact Admissions"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[var(--radius-card)] border border-gold/30 bg-white p-6">
                <h3 className="mb-4 font-bold text-navy">Fees</h3>
                {programme.fees ? (
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-slate">Intake</dt><dd>{programme.fees.intake}</dd></div>
                    <div><dt className="text-slate">Registration</dt><dd>{programme.fees.registrationFee}</dd></div>
                    <div><dt className="text-slate">Course fee</dt><dd>{programme.fees.courseFee}</dd></div>
                    {programme.fees.instalmentNote && (
                      <p className="pt-2 text-slate">{programme.fees.instalmentNote}</p>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-slate">
                    Available on request — contact Admissions on {SITE.phone} for the current fee structure.
                  </p>
                )}
              </div>

              <div id="enquire" className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
                <h3 className="mb-4 font-bold text-navy">Enquire about this programme</h3>
                <LeadForm
                  source="programme-page"
                  programmeId={programme.id}
                  programmeTitle={programme.title}
                  compact
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CTASection
        title="Interested in applying?"
        description={`Start your application for ${programme.title} or speak with Admissions for personalised guidance.`}
        primaryHref={`/apply?programme=${programme.slug}`}
        primaryLabel="Apply Online"
      />
    </>
  );
}
