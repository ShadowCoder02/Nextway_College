import { SITE, NAV_LINKS } from "@/constants/site";
import { whatsappUrl } from "@/lib/utils";
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Logo } from "./Logo";

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-gold">{children}</span>;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 mesh-overlay opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red via-gold to-brand-red" />

      <div className="container-nwc relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <Logo variant="footer" className="mb-6" />
          <p className="mb-4 text-sm leading-relaxed text-white/70">{SITE.supportingLine}</p>
          <p className="text-sm font-semibold text-gold">{SITE.tagline}</p>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Explore</h3>
          <ul className="space-y-3 text-sm text-white/75">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/branches" className="transition hover:text-white">
                Find a Branch
              </Link>
            </li>
            <li>
              <Link href="/apply" className="font-semibold text-gold transition hover:text-white">
                Apply Online (Portal) →
              </Link>
            </li>
            <li>
              <Link href="/apply/login" className="text-white/60 transition hover:text-white">
                Applicant Sign In
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Contact</h3>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <IconWrap><FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" /></IconWrap>
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <IconWrap><FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" /></IconWrap>
              <a href={`tel:${SITE.phoneTel}`} className="transition hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconWrap><FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5" /></IconWrap>
              <a href={`mailto:${SITE.email}`} className="transition hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconWrap><FontAwesomeIcon icon={faWhatsapp} className="h-3.5 w-3.5" /></IconWrap>
              <a
                href={whatsappUrl(SITE.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-gold">Legal</h3>
          <ul className="mb-6 space-y-3 text-sm text-white/75">
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-white">
                Terms of Use
              </Link>
            </li>
          </ul>
          <div className="flex gap-4">
            {Object.entries(SITE.social)
              .filter(([, url]) => Boolean(url))
              .map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs capitalize text-white/50 transition hover:text-gold"
                >
                  {key}
                </a>
              ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-nwc flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p>Kandy, Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
