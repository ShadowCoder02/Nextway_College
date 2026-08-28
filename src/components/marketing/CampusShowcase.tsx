import Image from "next/image";
import { IMAGES } from "@/constants/images";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function CampusShowcase() {
  return (
    <section className="section-padding overflow-hidden bg-pearl">
      <div className="container-nwc">
        <SectionHeader
          eyebrow="Campus & community"
          title="A distinguished environment for learning"
          description="Modern hybrid delivery supported by a welcoming academic community across Sri Lanka."
          align="center"
        />
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-card)] shadow-premium lg:col-span-7 lg:min-h-[440px]">
            <Image
              src={IMAGES.hero}
              alt="Nextway College International campus"
              fill
              className="object-cover transition duration-700 hover:scale-[1.02]"
              sizes="(max-width:1024px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="eyebrow mb-2 text-gold">Kandy, Sri Lanka</p>
              <p className="font-heading text-2xl font-semibold tracking-tight">
                Where ambition meets academic excellence
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:col-span-5">
            <div className="relative min-h-[200px] overflow-hidden rounded-[var(--radius-card)] shadow-soft lg:min-h-[208px]">
              <Image
                src={IMAGES.brand}
                alt="Students at Nextway College International"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 42vw"
              />
            </div>
            <div className="glass-panel flex flex-col justify-center p-8">
              <p className="eyebrow mb-3">Hybrid excellence</p>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-navy">
                Learn online. Connect in person.
              </h3>
              <p className="text-subtle">
                Our 80% online and 20% direct model combines flexibility with meaningful face-to-face
                sessions — designed for working learners and ambitious school leavers alike.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
