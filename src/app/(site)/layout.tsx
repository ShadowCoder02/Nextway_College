import { SiteShell } from "@/components/layout/SiteShell";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <SmoothScroll>
        <SiteShell>{children}</SiteShell>
      </SmoothScroll>
    </MotionProvider>
  );
}
