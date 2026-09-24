import { buildMetadata } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeadForm } from "@/components/ui/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { studentJourney } from "@/data/content";

export const metadata = buildMetadata({
  title: "Admissions",
  description: "Apply to Nextway College International. Learn about the admissions process and submit your enquiry.",
  path: "/admissions",
});

export default function AdmissionsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Admissions", href: "/admissions" }]} />
      <section className="bg-navy py-16 text-white lg:py-24">
        <div className="container-nwc max-w-4xl">
          <span className="eyebrow mb-3 block text-gold">Admissions 2026 Intake</span>
          <h1 className="text-display text-white">Start your application</h1>
          <p className="mt-6 text-xl text-white/85">
            Our Admissions team will guide you through programme selection, eligibility and next steps. You can complete your official application directly online or submit a general enquiry.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/apply" variant="gold" size="lg" magnetic>
              Apply Online Now →
            </Button>
            <Button href="/apply/login" variant="outline-light" size="lg">
              Applicant Portal Login
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <RevealGroup className="container-nwc grid gap-12 lg:grid-cols-2">
          <RevealItem>
          <div>
            <SectionHeader
              eyebrow="How it works"
              title="Your admissions journey"
            />
            <ol className="space-y-6">
              {studentJourney.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-bold text-navy">{step.title}</h3>
                    <p className="text-slate">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Card className="mt-10">
              <h3 className="mb-3 font-bold">What you may need</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-charcoal">
                <li>Educational certificates (O/L, A/L or equivalent)</li>
                <li>National ID or passport copy</li>
                <li>Passport-size photograph</li>
                <li>English proficiency evidence (if applicable)</li>
              </ul>
              <p className="mt-4 text-sm text-slate">
                Final document requirements are confirmed by Admissions for your chosen programme and intake.
              </p>
            </Card>
          </div>
          </RevealItem>

          <RevealItem>
          <Card variant="elevated" padding="lg">
            <SectionHeader
              title="Submit an enquiry"
              description="Complete the form and our team will contact you."
            />
            <LeadForm source="admissions-page" />
          </Card>
          </RevealItem>
        </RevealGroup>
      </section>
    </>
  );
}
