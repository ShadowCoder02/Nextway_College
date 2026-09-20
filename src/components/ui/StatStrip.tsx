import type { SiteStat } from "@/types";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

type StatStripProps = {
  stats: SiteStat[];
};

export function StatStrip({ stats }: StatStripProps) {
  return (
    <RevealGroup className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <RevealItem
          key={stat.label}
          className={`px-6 py-8 text-center ${i > 0 ? "sm:border-l sm:border-ice" : ""}`}
        >
          <p className="mb-2 font-heading text-3xl font-semibold text-brand-red lg:text-4xl">
            <AnimatedCounter value={stat.value} />
          </p>
          <p className="text-subtle mx-auto max-w-[12rem]">{stat.label}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
