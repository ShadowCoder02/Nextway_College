import Link from "next/link";
import { cn } from "@/lib/utils";

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
};

const variants = {
  primary:
    "bg-gradient-to-r from-brand-red to-brand-red-dark text-white shadow-lg shadow-brand-red/25 hover:brightness-110 active:scale-[0.99]",
  red: "bg-brand-red text-white hover:bg-brand-red-dark active:scale-[0.99]",
  secondary: "bg-navy text-white hover:bg-deep-blue shadow-lg shadow-navy/20 active:scale-[0.99]",
  outline:
    "border-2 border-navy/25 bg-white text-navy hover:border-brand-red hover:text-brand-red active:scale-[0.99]",
  "outline-light":
    "border-2 border-white/85 bg-white/10 text-white backdrop-blur-xs hover:bg-white hover:text-navy hover:border-white shadow-sm active:scale-[0.99]",
  ghost: "text-navy hover:bg-ice active:scale-[0.99]",
  "ghost-light": "text-white hover:bg-white/10 active:scale-[0.99]",
  gold: "bg-gold text-navy hover:brightness-105 shadow-md active:scale-[0.99]",
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
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
