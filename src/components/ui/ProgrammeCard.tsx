import Link from "next/link";
import type { Programme } from "@/types";
import { Badge } from "./Badge";
import { IMAGES } from "@/constants/images";
import { FallbackImage } from "./FallbackImage";

type ProgrammeCardProps = {
  programme: Programme;
  featured?: boolean;
};

export function ProgrammeCard({ programme, featured }: ProgrammeCardProps) {
  return (
    <article className="premium-card group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-16/10 overflow-hidden">
        <FallbackImage
          src={programme.imageUrl}
          fallbackSrc={IMAGES.campus}
          alt=""
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge>{programme.level}</Badge>
          {programme.flagship && <Badge variant="gold">Flagship</Badge>}
          {featured && !programme.flagship && <Badge variant="navy">Featured</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-red">
          {programme.schoolName}
        </p>
        <h3 className="mb-3 font-heading text-xl font-semibold text-navy lg:text-2xl">{programme.title}</h3>
        <p className="text-subtle mb-5 flex-1">{programme.shortPitch}</p>
        <div className="mb-5 flex flex-wrap gap-2 text-xs font-medium text-charcoal">
          <span className="rounded-full bg-ice px-3 py-1">{programme.duration}</span>
          <span className="rounded-full bg-ice px-3 py-1">{programme.mode}</span>
          <span className="rounded-full bg-ice px-3 py-1">{programme.location}</span>
        </div>
        <Link
          href={`/programmes/${programme.slug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-red transition hover:gap-3"
        >
          View programme
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
