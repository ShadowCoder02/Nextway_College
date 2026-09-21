import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/Magnetic";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "outline-light"
    | "ghost"
    | "ghost-light"
    | "red"
    | "gold";
  size?: "sm" | "md" | "lg";
  href?: string;
  /** Shows a spinner, sets aria-busy and blocks further clicks. */
  loading?: boolean;
  /** Desktop-only magnetic pull toward the cursor — use on the one primary CTA per view. */
  magnetic?: boolean;
};

const variants = {
  primary:
    "bg-gradient-to-r from-brand-red to-brand-red-dark text-white shadow-lg shadow-brand-red/25 hover:shadow-xl hover:shadow-brand-red/35 hover:brightness-110 active:scale-[0.99]",
  red: "bg-brand-red text-white hover:shadow-lg hover:bg-brand-red-dark active:scale-[0.99]",
  secondary: "bg-navy text-white hover:bg-deep-blue hover:shadow-xl shadow-lg shadow-navy/20 active:scale-[0.99]",
  outline:
    "border-2 border-navy/25 bg-white text-navy hover:shadow-lg hover:border-brand-red hover:text-brand-red active:scale-[0.99]",
  "outline-light":
    "border-2 border-white/85 bg-white/10 text-white backdrop-blur-xs hover:bg-white hover:text-navy hover:border-white hover:shadow-lg shadow-sm active:scale-[0.99]",
  ghost: "text-navy hover:bg-ice active:scale-[0.99]",
  "ghost-light": "text-white hover:bg-white/10 active:scale-[0.99]",
  gold: "bg-gold text-navy hover:brightness-105 hover:shadow-lg shadow-md active:scale-[0.99]",
};

const sizes = {
  sm: "px-5 py-2.5 text-sm tracking-wide",
  md: "px-7 py-3 text-sm font-semibold tracking-wide",
  lg: "px-9 py-4 text-base font-semibold tracking-wide",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  loading,
  magnetic,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-[transform,scale,box-shadow,background-color,color,border-color,filter] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] disabled:hover:scale-100 disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {children}
    </>
  );

  const element = href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <button className={classes} {...props} disabled={props.disabled || loading} aria-busy={loading || undefined}>
      {content}
    </button>
  );

  return magnetic ? <Magnetic>{element}</Magnetic> : element;
}
