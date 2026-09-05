import { buildMetadata } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeadForm } from "@/components/ui/LeadForm";
import { PageHero } from "@/components/ui/PageHero";
import { SITE } from "@/constants/site";
import { whatsappUrl } from "@/lib/utils";
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ContactIconWrap({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">{children}</span>;
}

export const metadata = buildMetadata({
  title: "Contact",
  description: `Contact ${SITE.name} — Admissions, campus location and enquiry form.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Reach Admissions by phone, email, WhatsApp or the enquiry form below."
      />

      <section className="section-padding">
        <div className="container-nwc grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader title="Admissions Office" />
            <dl className="space-y-6">
              <div className="premium-card p-5">
                <dt className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-red">
                  <ContactIconWrap><FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" /></ContactIconWrap>
                  Address
                </dt>
                <dd className="text-lg">{SITE.address}</dd>
              </div>
              <div className="premium-card p-5">
                <dt className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-red">
                  <ContactIconWrap><FontAwesomeIcon icon={faPhone} className="h-4 w-4" /></ContactIconWrap>
                  Phone
                </dt>
                <dd>
                  <a href={`tel:${SITE.phoneTel}`} className="text-lg font-semibold text-navy transition hover:text-brand-red">
                    {SITE.phone}
                  </a>
                </dd>
              </div>
              <div className="premium-card p-5">
                <dt className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-red">
                  <ContactIconWrap><FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" /></ContactIconWrap>
                  Email
                </dt>
                <dd>
                  <a href={`mailto:${SITE.email}`} className="text-lg font-semibold text-navy transition hover:text-brand-red">
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div className="premium-card p-5">
                <dt className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-red">
                  <ContactIconWrap><FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" /></ContactIconWrap>
                  WhatsApp
                </dt>
                <dd>
                  <a
                    href={whatsappUrl(SITE.whatsapp, "Hello Nextway College, I would like to enquire.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-navy transition hover:text-brand-red"
                  >
                    {SITE.whatsappDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="premium-card mt-8 p-6">
              <h3 className="mb-3 font-bold text-navy">Office Hours</h3>
              <p className="text-slate">Monday – Friday: 8:30 AM – 5:00 PM</p>
              <p className="text-slate">Saturday: 9:00 AM – 1:00 PM (by appointment)</p>
            </div>
          </div>

          <div className="premium-card p-8">
            <SectionHeader title="Send an Enquiry" />
            <LeadForm source="contact-page" />
          </div>
        </div>
      </section>
    </>
  );
}
