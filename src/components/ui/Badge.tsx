import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "gold" | "navy" | "brand-red" | "success" | "slate";
  className?: string;
};

const variants = {
  default: "bg-white/90 text-navy border border-navy/10",
  gold: "bg-gold text-navy font-bold",
  navy: "bg-navy text-white font-medium",
  "brand-red": "bg-brand-red text-white font-bold",
  success: "bg-success text-white font-bold",
  slate: "bg-slate/15 text-slate font-semibold",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
