import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "footer" | "admin";
};

function BrandText({ variant }: { variant: LogoProps["variant"] }) {
  const isFooter = variant === "footer";
  const isAdmin = variant === "admin";

  const lineOne = cn(
    "font-heading whitespace-nowrap text-[0.98rem] font-semibold leading-none tracking-tight sm:text-[1.06rem] lg:text-[1.15rem]",
    isFooter || isAdmin ? "text-white" : "text-navy",
  );

  const lineTwo = cn(
    "font-heading whitespace-nowrap text-[0.9rem] font-semibold leading-none tracking-tight sm:text-[0.98rem] lg:text-[1.02rem]",
    isFooter || isAdmin ? "text-brand-red" : "text-brand-red",
  );

  return (
    <div className="min-w-0 leading-none">
      <span className={lineOne}>
        <span className="text-brand-red">Nextway</span>{" "}
        <span className={isFooter || isAdmin ? "text-white" : "text-navy"}>College</span>
      </span>
      <span className={cn("block", lineTwo)}>International</span>
    </div>
  );
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const iconSizes = {
    default: "h-12 w-12 sm:h-[54px] sm:w-[54px] lg:h-[58px] lg:w-[58px]",
    footer: "h-16 w-16 sm:h-[72px] sm:w-[72px]",
    admin: "h-11 w-11",
  };

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3 sm:gap-3.5", className)}
      aria-label={SITE.name}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-white transition duration-300 group-hover:opacity-90",
          iconSizes[variant],
          variant === "footer" && "rounded-2xl p-1.5 shadow-lg",
          variant === "default" && "rounded-xl p-1 shadow-sm ring-1 ring-navy/5",
          variant === "admin" && "rounded-xl p-1 shadow-sm",
        )}
      >
        <Image
          src={SITE.logoIcon}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 640px) 54px, (max-width: 1024px) 58px, 72px"
          priority
        />
      </div>
      <BrandText variant={variant} />
    </Link>
  );
}
