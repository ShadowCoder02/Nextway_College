import { SITE } from "@/constants/site";
import { whatsappUrl } from "@/lib/utils";
import { faArrowUpRightFromSquare, faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-current">{children}</span>;
}

export function UtilityBar() {
  return (
    <div className="hidden bg-navy text-xs text-white/80 md:block">
      <div className="container-nwc flex items-center justify-between py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <a href="/contact" className="inline-flex items-center gap-2 transition hover:text-white">
            <IconWrap><FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" /></IconWrap>
            <span className="font-medium text-gold">{SITE.location}</span>
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="inline-flex items-center gap-2 transition hover:text-white">
            <IconWrap><FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" /></IconWrap>
            {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 transition hover:text-white">
            <IconWrap><FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" /></IconWrap>
            {SITE.email}
          </a>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 font-semibold text-gold transition-all hover:border-gold hover:bg-gold hover:text-navy"
          >
            <IconWrap><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5" /></IconWrap>
            Apply Online
          </Link>
          <a
            href={whatsappUrl(SITE.whatsapp, "Hello Nextway College, I would like to enquire.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <IconWrap><FontAwesomeIcon icon={faWhatsapp} className="h-3.5 w-3.5" /></IconWrap>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
