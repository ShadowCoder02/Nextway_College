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
import { IMAGES, HERO_BLUR_PLACEHOLDER } from "@/constants/images";
import { SITE } from "@/constants/site";
import {
  studentJourney,
  testimonials,
  trustPoints,
  whyNextWay,
} from "@/data/content";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getFeaturedProgrammes, getFlagshipProgramme } from "@/services/programmes";
import { getLatestNews } from "@/services/news";
import { getUpcomingEvents } from "@/services/events";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function HomePage() {
  const [featured, flagship, news, events] = await Promise.all([
    getFeaturedProgrammes(),
    getFlagshipProgramme(),
    getLatestNews(3),
    getUpcomingEvents(2),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] overflow-hidden hero-gradient text-white">
        <div className="mesh-overlay absolute inset-0" />
        <div className="absolute inset-0 opacity-20">
          <Image
            src={IMAGES.hero}
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
        <div className="absolute inset-0 bg-linear-to-r from-navy/85 via-navy/72 to-navy/55" />
        <div className="container-nwc relative flex min-h-[88vh] flex-col justify-center py-24 lg:py-32">
          <div className="max-w-3xl fade-up">
            <span className="eyebrow mb-5 block text-gold">{SITE.location}</span>
            <h1 className="text-display mb-6 text-white">{SITE.tagline}</h1>
            <p className="text-lead mb-10 max-w-2xl text-white/88">
              {SITE.supportingLine}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/programmes" variant="primary" size="lg">
                Explore Programmes
              </Button>
              <Button href="/admissions" variant="outline-light" size="lg">
                Apply for 2026 Intake
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* Trust strip */}
      <section className="relative -mt-12 z-10 pb-4">
        <div className="container-nwc">
          <div className="premium-card overflow-hidden">
            <StatStrip stats={trustPoints} />
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
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featured.slice(0, 3).map((p) => (
              <ProgrammeCard key={p.id} programme={p} featured />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/programmes" variant="secondary">
              View All Programmes
            </Button>
          </div>
        </div>
      </section>

      <ApprovalsStrip />

      <CampusShowcase />

      <HybridLearningSection />

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyNextWay.map((item) => (
              <article key={item.title} className="premium-card p-7">
                <div className="mb-4 h-1 w-10 rounded-full bg-brand-red" />
                <h3 className="mb-3 font-heading text-xl font-semibold">{item.title}</h3>
                <p className="text-subtle">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship BSc IT */}
      {flagship && (
        <section className="section-padding bg-navy text-white">
          <div className="container-nwc grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-4/3 overflow-hidden rounded-card shadow-premium">
              <FallbackImage
                src={flagship.imageUrl}
                fallbackSrc={IMAGES.campus}
                alt={flagship.title}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {studentJourney.map((step) => (
              <div key={step.step} className="premium-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-lg font-bold text-gold">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-slate">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="section-padding">
        <div className="container-nwc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="News" title="Latest updates" />
            <div className="space-y-5">
              {news.map((article) => (
                <article key={article.id} className="premium-card p-5">
                  <div className="-m-5 mb-4 overflow-hidden rounded-t-[var(--radius-card)]">
                    <div className="relative aspect-16/9">
                      <FallbackImage
                        src={article.coverImageUrl}
                        fallbackSrc={IMAGES.campus}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
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
                  <article key={event.id} className="premium-card p-5">
                    <div className="-m-5 mb-4 overflow-hidden rounded-t-[var(--radius-card)]">
                      <div className="relative aspect-16/9">
                        <FallbackImage
                          src={event.imageUrl}
                          fallbackSrc={IMAGES.campus}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
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
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="premium-card quote-mark p-7">
                <p className="mb-5 text-charcoal leading-relaxed">{t.quote}</p>
                <footer>
                  <cite className="not-italic font-bold text-navy">{t.studentName}</cite>
                  <p className="text-sm text-slate">{t.programme}</p>
                </footer>
              </blockquote>
            ))}
          </div>
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
