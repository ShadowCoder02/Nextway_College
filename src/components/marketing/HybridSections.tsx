import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { SITE } from "@/constants/site";
import { IMAGES } from "@/constants/images";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

const CHECKLIST = [
  `Study in ${SITE.mediums.join(" or ")} medium`,
  "Access classes from anywhere in Sri Lanka",
  "Direct sessions for labs, workshops and assessments",
  "Personal counselling from enquiry to graduation",
];

type HybridLearningSectionProps = {
  /** Which reference photo composite to show on the right — "campus" (the
   * default) frames the on-campus student group alongside the 80/20 ring
   * breakdown; "student" is a simpler alternate crop centred on solo online
   * study. Lets the two pages that render this section (home, about) show
   * different art instead of the identical image twice. */
  image?: "campus" | "student";
};

export function HybridLearningSection({ image = "campus" }: HybridLearningSectionProps) {
  const visual = image === "campus" ? IMAGES.hybridCampus : IMAGES.onlineStudent;
  const alt =
    image === "campus"
      ? "A student learning online from home on one side, and Nextway College International students collaborating together on campus on the other, with an 80% online learning / 20% direct sessions breakdown at the centre"
      : "A student learning online from home alongside Nextway College International students meeting for a direct session on campus";

  return (
    <section className="section-padding bg-navy text-white">
      <div className="container-nwc grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-4">
            <span className="eyebrow whitespace-nowrap text-gold">Hybrid learning model</span>
            <span className="h-px flex-1 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
          </div>
          <h2 className="text-section mb-5">
            <span className="block text-white">Learn anywhere.</span>
            <span className="block text-gold">Connect in person.</span>
          </h2>
          <p className="text-lead max-w-lg leading-relaxed text-white/80">
            Our 80/20 hybrid model gives you the freedom to study online, while bringing you
            together for the direct sessions, workshops and campus experiences that build real
            community.
          </p>

          <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/90">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold"
                  aria-hidden="true"
                >
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-[3/2] w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] shadow-premium">
          <Image src={visual} alt={alt} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
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
