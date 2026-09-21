import type { Programme } from "@/types";
import { SITE } from "@/constants/site";
import { FACT_KEYS, getProgrammeFacts, type ProgrammeFact } from "@/lib/programme-facts";

function FactValue({ fact }: { fact: ProgrammeFact }) {
  if (fact.state === "provided") return <span className="font-medium text-charcoal">{fact.value}</span>;
  if (fact.state === "on-request") {
    return (
      <span className="text-slate">
        Contact Admissions for the current fee structure — <a className="font-semibold text-brand-red underline underline-offset-2" href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>
      </span>
    );
  }
  return (
    <span className="text-slate">
      Not yet confirmed —{" "}
      <a className="font-semibold text-brand-red underline underline-offset-2" href="#enquire">
        ask Admissions
      </a>
    </span>
  );
}

/**
 * The single, shared "key facts" block for every programme page: the same
 * seven rows, in the same order, always — see FACT_KEYS. Rows the college
 * hasn't supplied say so plainly rather than being hidden or guessed.
 */
export function ProgrammeDetail({ programme }: { programme: Programme }) {
  const facts = getProgrammeFacts(programme);
  return (
    <section aria-labelledby="programme-facts" className="rounded-[var(--radius-card)] bg-ice p-6">
      <h2 id="programme-facts" className="mb-4 text-base font-bold text-navy">
        Programme facts
      </h2>
      <dl className="space-y-4 text-sm">
        {FACT_KEYS.map((key) => (
          <div key={key}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate">{facts[key].label}</dt>
            <dd className="mt-0.5">
              <FactValue fact={facts[key]} />
            </dd>
          </div>
        ))}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate">School &amp; level</dt>
          <dd className="mt-0.5 font-medium text-charcoal">
            {programme.schoolName} · {programme.level}
          </dd>
        </div>
      </dl>
    </section>
  );
}
