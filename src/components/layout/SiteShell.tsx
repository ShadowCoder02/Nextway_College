import { UtilityBar } from "./UtilityBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { getSchools } from "@/services/programmes";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const schools = (await getSchools()).map((s) => ({ slug: s.slug, name: s.name }));
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <UtilityBar />
      <Navbar schools={schools} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
