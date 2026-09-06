import { SiteShell } from "@/components/layout/SiteShell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProgrammeSearchBox } from "@/components/ui/ProgrammeSearchBox";
import { SITE } from "@/constants/site";

const QUICK_LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/admissions", label: "Admissions" },
  { href: "/apply", label: "Apply" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <SiteShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="text-section mb-4">Page not found</h1>
        <p className="mb-8 max-w-md text-slate">
          Sorry, the page you&apos;re looking for may have moved or no longer exists. Try searching
          for a programme, or use one of the links below.
        </p>

        <div className="mb-8 w-full">
          <ProgrammeSearchBox />
        </div>

        <nav aria-label="Quick links" className="mb-8 flex flex-wrap justify-center gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate/30 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:border-brand-red hover:text-brand-red"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button href="/" variant="primary" className="mb-4">
          Back to home
        </Button>

        <p className="text-sm text-slate">
          Need help? Call Admissions at{" "}
          <a href={`tel:${SITE.phoneTel}`} className="font-semibold text-brand-red hover:underline">
            {SITE.phone}
          </a>
        </p>
      </div>
    </SiteShell>
  );
}
