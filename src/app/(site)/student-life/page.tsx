import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = buildMetadata({
  title: "Student Life",
  description: "Discover campus life, student support and activities at Nextway College International.",
  path: "/student-life",
});

const highlights = [
  {
    title: "Campus environment",
    description: "A focused academic setting in Kandy designed for learning, collaboration and growth.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Learning support",
    description: "Guidance from lecturers and the Admissions team to help you settle into study.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Practical experiences",
    description: "Labs, workshops and project work that connect classroom learning to real skills.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  },
];

export default function StudentLifePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Student Life", href: "/student-life" }]} />
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc">
          <span className="eyebrow mb-3 block">Campus experience</span>
          <h1 className="text-display text-white">Student Life</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            More than classes — a supportive environment where you build skills, confidence and community.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc space-y-16">
          {highlights.map((item) => (
            <article key={item.title} className="grid items-center gap-8 lg:grid-cols-2">
              <div className="relative aspect-16/10 overflow-hidden rounded-[var(--radius-card)]">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="50vw" />
              </div>
              <div>
                <h2 className="text-section mb-4">{item.title}</h2>
                <div className="gold-rule mb-4" />
                <p className="text-lg text-charcoal">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ice py-16">
        <div className="container-nwc">
          <SectionHeader
            eyebrow="Support services"
            title="We are here to help"
            description="From your first enquiry through to graduation, student support is part of the Nextway experience."
            align="center"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Admissions counselling", "Academic guidance", "Career conversations", "Campus orientation"].map(
              (service) => (
                <div key={service} className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-soft)]">
                  <p className="font-semibold text-navy">{service}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <CTASection
            title="Experience Nextway for yourself"
        description="Visit our Open Day or speak with Admissions about campus life."
        primaryHref="/events"
        primaryLabel="View events"
      />
    </>
  );
}
