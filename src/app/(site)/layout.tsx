import { SiteShell } from "@/components/layout/SiteShell";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <SiteShell>{children}</SiteShell>
    </SmoothScroll>
  );
}
