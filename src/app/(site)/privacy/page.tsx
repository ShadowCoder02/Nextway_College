import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/ui/PageHero";
import { SITE } from "@/constants/site";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="How we protect and use your personal information." />
      <article className="section-padding">
        <div className="container-nwc max-w-3xl legal-prose">
          <p className="text-slate">Last updated: August 2026</p>
          <p>
            {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains how we
            collect, use and protect personal information submitted through our website and admissions channels.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>Contact details (name, email, phone) when you submit an enquiry or application</li>
            <li>Programme interests and messages you provide voluntarily</li>
            <li>Technical data such as browser type and pages visited (via analytics, if enabled)</li>
          </ul>
          <h2>How we use your information</h2>
          <ul>
            <li>To respond to enquiries and process admissions</li>
            <li>To communicate about programmes, events and intake updates</li>
            <li>To improve our website and services</li>
          </ul>
          <h2>Data sharing</h2>
          <p>
            We do not sell personal data. Information may be shared with service providers (e.g. hosting,
            email) under appropriate agreements, or when required by law.
          </p>
          <h2>Your rights</h2>
          <p>
            You may request access, correction or deletion of your personal data by contacting{" "}
            <a href={`mailto:${SITE.email}`} className="text-brand-red hover:underline">
              {SITE.email}
            </a>
            .
          </p>
          <h2>Contact</h2>
          <p>
            {SITE.name}, {SITE.address}. Email: {SITE.email}
          </p>
        </div>
      </article>
    </>
  );
}
