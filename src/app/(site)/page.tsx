import Image from "next/image";
import Link from "next/link";
import { ApprovalsStrip } from "@/components/marketing/ApprovalsStrip";
import { CampusShowcase } from "@/components/marketing/CampusShowcase";
import { BranchesSection, HybridLearningSection } from "@/components/marketing/HybridSections";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { HeroBackdrop, HeroContent } from "@/components/motion/HeroParallax";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TestimonialCarousel } from "@/components/motion/TestimonialCarousel";
import { JourneyTimeline } from "@/components/motion/JourneyTimeline";
import { IMAGES, HERO_BLUR_PLACEHOLDER, photoOrPlaceholder } from "@/constants/images";
import { SITE } from "@/constants/site";
import {
  studentJourney,
  testimonials,
} from "@/data/content";
import { formatDate, formatDateTime } from "@/lib/utils";
import { publishedTestimonials } from "@/lib/testimonials";
import { getWhyNextWayItems } from "@/lib/why-nextway";
import { getFeaturedProgrammes, getFlagshipProgramme, getProgrammes, getSchoolsWithProgrammeCounts } from "@/services/programmes";
import type { SiteStat } from "@/types";
import { getLatestNews } from "@/services/news";
import { getUpcomingEvents } from "@/services/events";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function HomePage() {
  const [featured, flagship, news, events, allProgrammes, schoolCounts] = await Promise.all([
    getFeaturedProgrammes(),
    getFlagshipProgramme(),
    getLatestNews(3),
    getUpcomingEvents(2),
    getProgrammes(),
    getSchoolsWithProgrammeCounts(),
  ]);

  // Trust strip: only facts that can be read straight from the site's own
  // data — never a hand-typed number. (The "22 branches" claim is unverified;
  // see content/TODO-content.md.)
  const schoolsWithProgrammes = schoolCounts.filter((s) => s.programmeCount > 0).length;
  const trustStats: SiteStat[] = [
    { value: "80/20", label: "Hybrid: online and direct classes" },
    { value: String(allProgrammes.length), label: "Programmes on offer" },
    { value: String(schoolsWithProgrammes), label: "Academic schools" },
    { value: String(SITE.mediums.length), label: `${SITE.mediums.join(" & ")} medium` },
  ];
  const whyItems = getWhyNextWayItems();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] overflow-hidden hero-gradient text-white">
        <div className="mesh-overlay absolute inset-0" />
        <HeroBackdrop className="absolute inset-x-0 -top-[30%] bottom-0 opacity-20">
          <Image
            src={IMAGES.heroBackdrop}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            quality={40}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL={HERO_BLUR_PLACEHOLDER}
          />
        </HeroBackdrop>
        <div className="absolute inset-0 bg-linear-to-r from-navy/85 via-navy/72 to-navy/55" />
        <div className="container-nwc relative flex min-h-[88vh] flex-col justify-center py-24 lg:py-32">
          <HeroContent className="max-w-4xl">
            <div className="fade-up">
              <span className="eyebrow mb-5 block text-gold">{SITE.location}</span>
              <h1 className="text-display mb-6 text-white">{SITE.tagline}</h1>
              <p className="text-lead mb-8 max-w-2xl text-white/90">{SITE.supportingLine}</p>
              <div className="flex flex-wrap gap-4">
                <Button href="/programmes" variant="primary" size="lg" magnetic>
                  Explore Programmes
                </Button>
                <Button href="/contact" variant="outline-light" size="lg">
                  Talk to Admissions
                </Button>
              </div>

              {/* The four questions a visitor arrives with, each answered
                  with a fact from the site and one link to act on it. */}
              <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { q: "What can I study?", a: `${allProgrammes.length} programmes across ${schoolsWithProgrammes} schools`, href: "/programmes" },
                  { q: "Is it right for me?", a: "See entry requirements, or speak to a counsellor", href: "/admissions" },
                  { q: "How will I learn?", a: `80% online, 20% direct classes, in ${SITE.mediums.join(" or ")}`, href: "#hybrid" },
                  { q: "What do I do next?", a: "Apply online for the 2026 intake", href: "/apply" },
                ].map((item) => (
                  <li key={item.q}>
                    <Link
                      href={item.href}
                      className="group block h-full rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:border-gold/60 hover:bg-white/15"
                    >
                      <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold">{item.q}</span>
                      <span className="mt-1 block text-sm leading-snug text-white">{item.a}</span>
                      <span aria-hidden="true" className="mt-2 inline-block text-sm text-gold transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </HeroContent>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* Trust strip */}
      <section className="relative -mt-12 z-10 pb-4">
        <div className="container-nwc">
          <div className="premium-card overflow-hidden">
            <StatStrip stats={trustStats} />
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="section-padding bg-pearl">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Academic Excellence"
            title="Programmes built for distinguished careers"
            description="Degree, law, geography, political science, education, English, Tamil and professional training — delivered through our hybrid model."
          />
          <RevealGroup className="grid gap-8 md:grid-cols-2 xl:grid-cols-3" stagger={0.08}>
            {featured.slice(0, 3).map((p) => (
              <RevealItem key={p.id} className="h-full">
                <ProgrammeCard programme={p} featured />
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="mt-12 text-center">
            <Button href="/programmes" variant="secondary">
              View All Programmes
            </Button>
          </div>
        </div>
      </section>

      <HybridLearningSection interactive />

      <ApprovalsStrip />

      <CampusShowcase />

      <BranchesSection />

      {/* Why Nextway */}
      <section className="section-padding">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="The Nextway Difference"
            title="An institute designed for your ambition"
            description="Structured academic excellence combined with practical experiences and personal guidance."
            align="center"
          />
          <RevealGroup className="flex flex-wrap justify-center gap-6">
            {whyItems.map((item) => (
              <RevealItem key={item.title} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                <article className="premium-card h-full p-7">
                  <div className="mb-4 h-1 w-10 rounded-full bg-brand-red" />
                  <h3 className="mb-3 font-heading text-xl font-semibold">{item.title}</h3>
                  <p className="text-subtle">{item.description}</p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Flagship BSc IT */}
      {flagship && (
        <section className="section-padding bg-navy text-white">
          <div className="container-nwc grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-4/3 overflow-hidden rounded-card shadow-premium">
              <FallbackImage
                src={photoOrPlaceholder(flagship.imageUrl)}
                fallbackSrc={IMAGES.campus}
                alt={flagship.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
            </div>
            <div>
              <span className="eyebrow mb-3 block text-gold">Flagship Programme</span>
              <h2 className="text-section mb-4 text-white">{flagship.title}</h2>
              <div className="gold-rule mb-5" />
              <p className="mb-6 text-lg leading-relaxed text-white/80">{flagship.whyThisProgramme}</p>
              <ul className="mb-8 space-y-3">
                {flagship.learningOutcomes.slice(0, 3).map((o) => (
                  <li key={o} className="flex gap-3 text-white/90">
                    <span className="font-bold text-gold" aria-hidden="true">✓</span> {o}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button href={`/programmes/${flagship.slug}`} variant="primary">
                  Explore BSc IT
                </Button>
                <Button href="/admissions" variant="outline-light">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Student journey */}
      <section className="section-padding bg-ice">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Your Journey"
            title="From enquiry to opportunity"
            align="center"
          />
          <JourneyTimeline steps={studentJourney} />
        </div>
      </section>

      {/* News & Events */}
      <section className="section-padding">
        <div className="container-nwc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="News" title="Latest updates" />
            <div className="space-y-5">
              {news.map((article) => (
                <article key={article.id} className="premium-card card-choreo group p-5">
                  <div className="-m-5 mb-4 overflow-hidden rounded-t-[var(--radius-card)]">
                    <div className="relative aspect-16/9">
                      <FallbackImage
                        src={article.coverImageUrl}
                        fallbackSrc={IMAGES.campus}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 600px"
                      />
                    </div>
                  </div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-red">
                    {formatDate(article.publishedAt)}
                  </p>
                  <h3 className="mb-2 text-lg font-bold">
                    <Link href={`/news/${article.slug}`} className="hover:text-brand-red">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-slate">{article.excerpt}</p>
                </article>
              ))}
            </div>
            <Button href="/news" variant="ghost" className="mt-5">
              All news →
            </Button>
          </div>
          <div>
            <SectionHeader eyebrow="Events" title="Upcoming events" />
            {events.length === 0 ? (
              <EmptyState heading="No upcoming events are scheduled right now" body="Check back soon." />
            ) : (
              <div className="space-y-5">
                {events.map((event) => (
                  <article key={event.id} className="premium-card card-choreo group p-5">
                    <div className="-m-5 mb-4 overflow-hidden rounded-t-[var(--radius-card)]">
                      <div className="relative aspect-16/9">
                        <FallbackImage
                          src={event.imageUrl}
                          fallbackSrc={IMAGES.campus}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 600px"
                        />
                      </div>
                    </div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-deep-blue">
                      {formatDateTime(event.startAt)}
                    </p>
                    <h3 className="mb-2 text-lg font-bold">
                      <Link href={`/events/${event.slug}`} className="hover:text-brand-red">
                        {event.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate">{event.summary}</p>
                  </article>
                ))}
              </div>
            )}
            <Button href="/events" variant="ghost" className="mt-5">
              All events →
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-pearl">
        <div className="container-nwc">
          <SectionHeader eyebrow="Student Voices" title="What learners say" align="center" />
          <Reveal>
            <TestimonialCarousel
              testimonials={publishedTestimonials(testimonials)}
            />
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Ready to take the next step?"
        description="Speak with Admissions about programmes, entry requirements and the 2026 intake."
        primaryLabel="Start Your Application"
        secondaryLabel="Request Information"
      />
    </>
  );
}
