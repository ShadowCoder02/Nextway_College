import Link from "next/link";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** JSON-LD is always emitted; the visible trail is opt-in per page. */
  visible?: boolean;
  className?: string;
};

export function Breadcrumbs({ items, visible = false, className }: BreadcrumbsProps) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(trail)) }}
      />
      {visible && (
        <nav aria-label="Breadcrumb" className={className}>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate">
            {trail.map((item, index) => (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {index === trail.length - 1 ? (
                  <span aria-current="page" className="font-semibold text-navy">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-brand-red">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
