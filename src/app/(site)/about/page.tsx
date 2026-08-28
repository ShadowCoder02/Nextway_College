import { buildMetadata } from "@/lib/seo";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageHero } from "@/components/ui/PageHero";
import { ApprovalsStrip } from "@/components/marketing/ApprovalsStrip";
import { BranchesSection, HybridLearningSection } from "@/components/marketing/HybridSections";
import { IMAGES } from "@/constants/images";
import { whyNextWay } from "@/data/content";
import { SITE } from "@/constants/site";

export const metadata = buildMetadata({
  title: "About Us",
  description: `Learn about ${SITE.name}, our hybrid learning model, island-wide branches and commitment to career-focused higher education.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={SITE.name}
        description={SITE.description}
        image={IMAGES.campus}
      />

      <section className="py-16 lg:py-24">
        <div className="container-nwc grid gap-12 lg:grid-cols-2">
          <div className="glass-panel p-8">
            <SectionHeader eyebrow="Mission" title="Learn Today. Lead Tomorrow." />
            <p className="text-lg text-charcoal">
              Nextway College International exists to help students build knowledge, skills and
              confidence for meaningful careers through a modern hybrid model — 80% online and
              20% direct classes — with English and Tamil medium options.
            </p>
          </div>
          <div className="glass-panel p-8">
            <SectionHeader eyebrow="Vision" title="Education that moves futures forward" />
            <p className="text-lg text-charcoal">
              We aspire to be a trusted higher-education institution across Sri Lanka — known for
              accessible programmes, accredited partnerships, professional standards and graduates
              prepared to contribute in workplaces and communities.
            </p>
          </div>
        </div>
      </section>

      <HybridLearningSection />
      <BranchesSection />
      <ApprovalsStrip compact />

      <section className="bg-ice py-16 lg:py-24">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Our values"
            title="What guides us"
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyNextWay.map((item) => (
              <article key={item.title} className="glass-panel p-6">
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-slate">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc max-w-3xl glass-panel p-8">
          <SectionHeader eyebrow="Location" title="Based in Kandy" />
          <p className="text-lg text-charcoal">
            Our headquarters in Kandy coordinates academic delivery and student services across
            22 branches island-wide, making higher education accessible wherever you are in Sri Lanka.
          </p>
          <p className="mt-4 text-slate">{SITE.address}</p>
        </div>
      </section>

      <CTASection
        title="Join our community"
        description="Explore programmes or speak with Admissions to find the right pathway for you."
      />
    </>
  );
}
