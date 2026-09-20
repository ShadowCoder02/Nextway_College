import Image from "next/image";
import { APPROVALS, type Approval } from "@/constants/approvals";
import { SectionHeader } from "@/components/ui/SectionHeader";

type ApprovalsStripProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

function ApprovalCard({ item }: { item: Approval }) {
  return (
    <div className="premium-card flex h-full flex-col items-center gap-3 p-6 text-center">
      <div className={`relative w-full opacity-90 ${item.large ? "h-20 max-w-[170px]" : "h-16 max-w-[140px]"}`}>
        <Image src={item.logo} alt={item.name} fill className="object-contain" sizes={item.large ? "170px" : "140px"} />
      </div>
      <p className="text-sm font-bold text-navy">{item.name}</p>
      {item.description && <p className="text-xs text-slate">{item.description}</p>}
      {item.verifyUrl && (
        <a
          href={item.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-brand-red underline underline-offset-2 hover:text-brand-red/80"
        >
          Verify →
        </a>
      )}
    </div>
  );
}

export function ApprovalsStrip({
  title = "Accreditations & Affiliations",
  description = "Recognised partnerships that build trust in our academic standards and global outlook.",
  compact = false,
}: ApprovalsStripProps) {
  return (
    <section className={compact ? "py-12" : "section-padding bg-ice"}>
      <div className="container-nwc">
        {!compact && (
          <SectionHeader eyebrow="Trusted credentials" title={title} description={description} align="center" />
        )}
        {compact ? (
          <div className="glass-panel mx-auto max-w-6xl p-6 lg:p-10">
            <div className="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {APPROVALS.map((item) => (
                <div
                  key={item.name}
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 p-4 transition hover:-translate-y-1 hover:bg-white/90"
                >
                  <div
                    className={`relative w-full opacity-90 transition group-hover:opacity-100 ${
                      item.large ? "h-20 max-w-[170px]" : "h-16 max-w-[140px]"
                    }`}
                  >
                    <Image src={item.logo} alt={item.name} fill className="object-contain" sizes={item.large ? "170px" : "140px"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="marquee mx-auto max-w-6xl py-4">
            <div className="marquee-track">
              <ul className="flex shrink-0">
                {APPROVALS.map((item) => (
                  <li key={item.name} className="w-56 shrink-0 pr-5">
                    <ApprovalCard item={item} />
                  </li>
                ))}
              </ul>
              {/* Duplicate copy makes the -50% loop seamless; hidden from
                  assistive tech and made inert so any verify links inside it
                  can't be tabbed to twice. */}
              <ul className="marquee-dup flex shrink-0" aria-hidden="true" inert>
                {APPROVALS.map((item) => (
                  <li key={item.name} className="w-56 shrink-0 pr-5">
                    <ApprovalCard item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
