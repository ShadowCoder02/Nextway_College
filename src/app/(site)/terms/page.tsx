import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SITE } from "@/constants/site";

export const metadata = buildMetadata({
  title: "Terms of Use",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Terms of Use", href: "/terms" }]} />
      <PageHero eyebrow="Legal" title="Terms of Use" description="Terms governing use of our website and enquiry services." />
      <article className="section-padding">
        <div className="container-nwc max-w-3xl legal-prose">
          <p className="text-slate">Last updated: August 2026</p>
          <p>
            By accessing the website of {SITE.name}, you agree to these terms. If you do not agree, please
            do not use this site.
          </p>
          <h2>Use of content</h2>
          <p>
            Programme descriptions, fees and intake information are provided for general guidance. Official
            details are confirmed by Admissions at the time of application.
          </p>
          <h2>Accuracy</h2>
          <p>
            We aim to keep information accurate and up to date but do not guarantee completeness. Verified
            partner and accreditation claims are published only after institutional confirmation.
          </p>
          <h2>Enquiries</h2>
          <p>
            Submitting an enquiry does not constitute an offer of admission. All applications are subject to
            eligibility review and availability.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href={`mailto:${SITE.email}`} className="text-brand-red hover:underline">
              {SITE.email}
            </a>
          </p>
        </div>
      </article>
    </>
  );
}
