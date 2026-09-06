import Image from "next/image";
import { APPROVALS } from "@/constants/approvals";
import { SectionHeader } from "@/components/ui/SectionHeader";

type ApprovalsStripProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

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
                  <div className="relative h-16 w-full max-w-[140px] opacity-90 transition group-hover:opacity-100">
                    <Image src={item.logo} alt={item.name} fill className="object-contain" sizes="140px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {APPROVALS.map((item) => (
              <div
                key={item.name}
                className="premium-card flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-1"
              >
                <div className="relative h-16 w-full max-w-[140px] opacity-90">
                  <Image src={item.logo} alt={item.name} fill className="object-contain" sizes="140px" />
                </div>
                <p className="text-sm font-bold text-navy">{item.name}</p>
                <p className="text-xs text-slate">{item.description}</p>
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
