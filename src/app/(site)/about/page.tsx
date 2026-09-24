import { buildMetadata } from "@/lib/seo";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ApprovalsStrip } from "@/components/marketing/ApprovalsStrip";
import { BranchesSection, HybridLearningSection } from "@/components/marketing/HybridSections";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { IMAGES } from "@/constants/images";
import { getWhyNextWayItems } from "@/lib/why-nextway";
import { SITE } from "@/constants/site";

export const metadata = buildMetadata({
  title: "About Us",
  description: `Learn about ${SITE.name}, our hybrid learning model, island-wide branches and commitment to career-focused higher education.`,
  path: "/about",
});

export default function AboutPage() {
  const whyItems = getWhyNextWayItems();

  return (
    <>
      <Breadcrumbs items={[{ label: "About", href: "/about" }]} />
      <PageHero
        eyebrow="About Us"
        title={SITE.name}
        description={SITE.description}
        image={IMAGES.campus}
      />

      <section className="py-16 lg:py-24">
        <RevealGroup className="container-nwc grid gap-12 lg:grid-cols-2">
          <RevealItem>
            <div className="glass-panel h-full p-8">
              <SectionHeader eyebrow="Mission" title="Learn Today. Lead Tomorrow." />
              <p className="text-lg text-charcoal">
                Nextway College International exists to help students build knowledge, skills and
                confidence for meaningful careers through a modern hybrid model — 80% online and
                20% direct classes — with English and Tamil medium options.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="glass-panel h-full p-8">
              <SectionHeader eyebrow="Vision" title="Education that moves futures forward" />
              <p className="text-lg text-charcoal">
                We aspire to be a trusted higher-education institution across Sri Lanka — known for
                accessible programmes, professional standards and graduates prepared to contribute
                in workplaces and communities.
              </p>
            </div>
          </RevealItem>
        </RevealGroup>
      </section>

      <HybridLearningSection image="student" />
      <BranchesSection />
      <ApprovalsStrip compact />

      {whyItems.length > 0 && (
        <section className="bg-ice py-16 lg:py-24">
          <div className="container-nwc">
            <SectionHeader eyebrow="Our values" title="What guides us" align="center" />
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyItems.map((item) => (
                <RevealItem key={item.title} className="h-full">
                  <article className="glass-panel h-full p-6">
                    <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                    <p className="text-slate">{item.description}</p>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24">
        <div className="container-nwc max-w-3xl">
          <Reveal>
            <div className="glass-panel p-8">
              <SectionHeader eyebrow="Location" title="Based in Kandy" />
              <p className="text-lg text-charcoal">
                Our headquarters in Kandy coordinates academic delivery and student services across
                our branch network, making higher education accessible wherever you are in Sri
                Lanka.
              </p>
              <p className="mt-4 text-slate">{SITE.address}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Join our community"
        description="Explore programmes or speak with Admissions to find the right pathway for you."
      />
    </>
  );
}
