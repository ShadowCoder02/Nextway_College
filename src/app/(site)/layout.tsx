import { SiteShell } from "@/components/layout/SiteShell";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { PortalHandoff } from "@/components/motion/PortalHandoff";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <SiteShell>{children}</SiteShell>
      <CustomCursor />
      <PortalHandoff />
    </SmoothScroll>
  );
}
