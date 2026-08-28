import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  light,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow mb-3 block", light && "text-gold")}>{eyebrow}</span>
      )}
      <h2 className={cn("text-section mb-4", light && "text-white")}>{title}</h2>
      <div className={cn("gold-rule mb-5", align === "center" && "mx-auto")} />
      {description && (
        <p className={cn("text-lead leading-relaxed", light ? "text-white/80" : "text-slate")}>
          {description}
        </p>
      )}
    </div>
  );
}
