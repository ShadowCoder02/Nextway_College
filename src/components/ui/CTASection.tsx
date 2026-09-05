import { Button } from "./Button";
import { cn } from "@/lib/utils";

type CTASectionProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CTASection({
  title,
  description,
  primaryHref = "/apply",
  primaryLabel = "Apply Online",
  secondaryHref = "/contact",
  secondaryLabel = "Contact Admissions",
  className,
}: CTASectionProps) {
  return (
    <section className={cn("relative overflow-hidden hero-gradient py-20 text-white lg:py-28", className)}>
      <div className="mesh-overlay absolute inset-0" />
      <div className="container-nwc relative text-center">
        <h2 className="text-section mb-5 text-white">{title}</h2>
        <div className="gold-rule mx-auto mb-6" />
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </Button>
          <Button href={secondaryHref} variant="outline-light" size="lg">
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
