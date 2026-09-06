import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/constants/site";
import { getProgrammeBySlug } from "@/services/programmes";
import { RememberProgramme } from "@/components/applicant/RememberProgramme";

export const metadata = buildMetadata({
  title: "Online Student Application Portal",
  description:
    "Apply online to Nextway College International. Start your application, submit qualifications, upload documents, and track your admission status.",
  path: "/apply",
});

type PageProps = {
  searchParams: Promise<{ programme?: string }>;
};

export default async function ApplyLandingPage({ searchParams }: PageProps) {
  const { programme: requestedSlug } = await searchParams;
  // Looking the slug up against the real catalogue is the validation: an
  // unknown or malformed value (e.g. a reflected-XSS attempt) simply finds
  // no programme and falls back to the unselected state below — nothing is
  // ever rendered from the raw query param itself.
  const programme = requestedSlug ? await getProgrammeBySlug(requestedSlug) : undefined;

  const registerHref = programme ? `/apply/register?programme=${programme.slug}` : "/apply/register";
  const loginHref = programme ? `/apply/login?programme=${programme.slug}` : "/apply/login";

  return (
    <>
      {programme && <RememberProgramme slug={programme.slug} />}

      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient py-20 text-white lg:py-28">
        <div className="mesh-overlay absolute inset-0" />
        <div className="container-nwc relative">
          <div className="max-w-3xl">
            <span className="eyebrow mb-4 block text-gold">Admissions 2026 Intake</span>
            <h1 className="text-display mb-6 text-white">Online Student Application Portal</h1>
            <p className="text-lead mb-8 text-white/90">
              Begin your journey towards an internationally recognised qualification. Our digital admissions portal allows you to complete your application progressively, save your progress, upload credentials, and track your admission outcome online.
            </p>
            {programme && (
              <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-white/10 px-5 py-3 text-sm text-white">
                <span>
                  You&apos;re applying for <strong className="text-gold">{programme.title}</strong>.
                </span>
                <Link href="/programmes" className="font-semibold underline underline-offset-2 hover:text-gold">
                  Change programme
                </Link>
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              <Button href={registerHref} variant="primary" size="lg">
                Start New Application
              </Button>
              <Button href={loginHref} variant="outline-light" size="lg">
                Sign In to Continue Application
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Process */}
      <section className="section-padding bg-ice">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Application Process"
            title="How the online application works"
            description="Our straightforward 5-step digital application takes under 15 minutes to complete."
            align="center"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mt-10">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Register your applicant profile with your verified email and mobile number.",
              },
              {
                step: "02",
                title: "Personal Details",
                desc: "Enter your official personal, contact, and emergency details.",
              },
              {
                step: "03",
                title: "Qualifications",
                desc: "Record your school examinations (O/L, A/L) and previous academic certificates.",
              },
              {
                step: "04",
                title: "Upload Documents",
                desc: "Securely upload copies of your NIC/Passport, certificates, and photograph.",
              },
              {
                step: "05",
                title: "Review & Submit",
                desc: "Review your application, sign the declaration, and track real-time admission progress.",
              },
            ].map((item) => (
              <div key={item.step} className="premium-card p-6 text-center">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold font-bold text-base">
                  {item.step}
                </span>
                <h3 className="mb-2 font-bold text-navy text-lg">{item.title}</h3>
                <p className="text-xs text-slate leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Information & Requirements */}
      <section className="section-padding">
        <div className="container-nwc grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <SectionHeader
              eyebrow="Before You Begin"
              title="Documents & Information to prepare"
              description="Having the following documents ready in PDF or image format will help you complete your application seamlessly."
            />
            <div className="space-y-4">
              {[
                {
                  title: "Identification",
                  desc: "National Identity Card (NIC), valid Passport, or Birth Certificate.",
                },
                {
                  title: "Academic Credentials",
                  desc: "GCE O/L and A/L result sheets, certificates, or pending results statement.",
                },
                {
                  title: "Recent Photograph",
                  desc: "Clear passport-style headshot with plain background.",
                },
                {
                  title: "Prior Higher Education (If applicable)",
                  desc: "Transcripts or certificates of completed diplomas, HNDs, or degree modules.",
                },
              ].map((req, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-slate/15 bg-pearl p-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-navy font-bold text-sm"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-navy text-sm">{req.title}</h4>
                    <p className="text-xs text-slate mt-0.5">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] bg-navy p-8 text-white shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-2">2026 Admissions Open</h3>
            <div className="gold-rule mb-6" />
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Applications are currently being accepted for Degree, Higher Diploma, Diploma, and Certificate programmes across all branches and hybrid streams.
            </p>
            <div className="space-y-3 mb-8 text-xs text-white/75">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Study Mediums:</span>
                <span className="font-semibold text-white">English & Tamil</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Learning Model:</span>
                <span className="font-semibold text-gold">Hybrid (80% Online, 20% Direct)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Campuses / Branches:</span>
                <span className="font-semibold text-white">Kandy, Colombo, Galle & 22 Islandwide</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-white/60">Admissions Helpline:</span>
                <span className="font-semibold text-gold">{SITE.phone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button href={registerHref} variant="primary" className="w-full">
                Start Online Application
              </Button>
              <Button href={loginHref} variant="outline-light" className="w-full">
                Already Registered? Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
