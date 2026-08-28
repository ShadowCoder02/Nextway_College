import { SiteShell } from "@/components/layout/SiteShell";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="text-section mb-4">Page not found</h1>
        <p className="mb-8 max-w-md text-slate">
          The page you are looking for may have moved or no longer exists.
        </p>
        <Button href="/" variant="primary">
          Back to home
        </Button>
        <Link href="/programmes" className="mt-4 text-sm font-semibold text-brand-red hover:underline">
          Browse programmes
        </Link>
      </div>
    </SiteShell>
  );
}
