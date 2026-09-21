import { cn } from "@/lib/utils";

const variants = {
  /** Flat tinted surface for grouped facts, filters and empty states. */
  panel: "rounded-[var(--radius-card)] bg-ice",
  /** White raised card with hover lift (see `.premium-card` in globals.css). */
  elevated: "premium-card",
  /** White with a hairline border, for quiet emphasis. */
  outline: "rounded-[var(--radius-card)] border border-slate/15 bg-white",
} as const;

const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8 sm:p-10" } as const;

type CardProps<T extends React.ElementType> = {
  as?: T;
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className"> & { className?: string };

/** The one card primitive. Use it instead of hand-writing
 * `rounded-[var(--radius-card)] bg-ice p-6` so radius, surface and padding
 * stay consistent across pages. */
export function Card<T extends React.ElementType = "div">({
  as,
  variant = "panel",
  padding = "md",
  className,
  ...props
}: CardProps<T>) {
  const Component: React.ElementType = as ?? "div";
  return <Component className={cn(variants[variant], paddings[padding], className)} {...props} />;
}
