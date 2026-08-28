import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  image?: string;
};

export function PageHero({ eyebrow, title, description, className, image }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden hero-gradient text-white", className)}>
      <div className="mesh-overlay absolute inset-0" />
      {image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/75" />
        </>
      )}
      <div className="container-nwc relative py-20 lg:py-28">
        {eyebrow && <span className="eyebrow mb-4 block text-gold">{eyebrow}</span>}
        <h1 className="text-display max-w-4xl text-white">{title}</h1>
        {description && (
          <p className="text-lead mt-6 max-w-2xl text-white/85">{description}</p>
        )}
        <div className="gold-rule mt-8" />
      </div>
    </section>
  );
}
