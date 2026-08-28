import { SITE } from "@/constants/site";
import { whatsappUrl } from "@/lib/utils";
import Link from "next/link";

export function UtilityBar() {
  return (
    <div className="hidden bg-navy text-xs text-white/80 md:block">
      <div className="container-nwc flex items-center justify-between py-2.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-medium text-gold">{SITE.location}</span>
          <a href={`tel:${SITE.phoneTel}`} className="transition hover:text-white">
            {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="transition hover:text-white">
            {SITE.email}
          </a>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/admissions"
            className="inline-flex items-center rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 font-semibold text-gold transition-colors hover:border-gold hover:bg-gold hover:text-navy"
          >
            Apply Now
          </Link>
          <a
            href={whatsappUrl(SITE.whatsapp, "Hello Nextway College, I would like to enquire.")}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
