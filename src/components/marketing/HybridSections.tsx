import Image from "next/image";
import { SITE } from "@/constants/site";
import { IMAGES } from "@/constants/images";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function HybridLearningSection() {
  return (
    <section className="section-padding bg-navy text-white">
      <div className="container-nwc grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="Hybrid learning model"
            title="80% online · 20% direct"
            description="A modern blend of flexible online study with focused in-person sessions for practical learning and community."
            light
          />
          <ul className="mt-8 space-y-4">
            {[
              `Study in ${SITE.mediums.join(" or ")} medium`,
              "Access classes from anywhere in Sri Lanka",
              "Direct sessions for labs, workshops and assessments",
              "Personal counselling from enquiry to graduation",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-white/90">
                <span className="font-bold text-gold" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-panel-dark grid gap-4 p-8">
          <div className="rounded-2xl bg-white/10 p-6 text-center">
            <p className="text-4xl font-bold text-gold">80%</p>
            <p className="text-sm uppercase tracking-wider text-white/70">Online classes</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 text-center">
            <p className="text-4xl font-bold text-brand-red">20%</p>
            <p className="text-sm uppercase tracking-wider text-white/70">Direct sessions</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BranchesSection() {
  return (
    <section className="section-padding">
      <div className="container-nwc">
        <SectionHeader
          eyebrow="Island-wide presence"
          title="22 branches across Sri Lanka"
          description="Including Kandy, Colombo, Galle, Batticaloa, Kegalle, Kurunegala, Kalutara and more."
          align="center"
        />
        <div className="glass-panel mx-auto max-w-4xl p-8 text-center">
          <div className="relative mx-auto mb-6 h-64 w-48 sm:h-72 sm:w-56">
            <Image
              src={IMAGES.branchMap}
              alt="Map of Sri Lanka marked with Nextway College International branch locations island-wide"
              fill
              className="object-contain"
              sizes="(max-width:640px) 12rem, 14rem"
            />
          </div>
          <Button href="/branches" variant="secondary">
            Find your nearest branch
          </Button>
        </div>
      </div>
    </section>
  );
}
