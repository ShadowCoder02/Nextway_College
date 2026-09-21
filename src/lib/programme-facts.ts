import type { Programme } from "@/types";
import { clientValue, needsInput } from "@/lib/client-input";
import { DEFAULT_LEARNING_OUTCOMES } from "@/data/programmes-seed";

/**
 * Every programme page must answer the same seven questions. This is enforced
 * structurally: `getProgrammeFacts` returns a `Record<FactKey, ProgrammeFact>`,
 * so adding a key to FACT_KEYS without handling it is a compile error, and a
 * programme with missing data still renders the row (as "not yet confirmed")
 * instead of silently omitting it.
 */
export const FACT_KEYS = [
  "awardingInstitution",
  "recognition",
  "entryRequirements",
  "fees",
  "duration",
  "deliveryMode",
  "nextIntake",
] as const;
export type FactKey = (typeof FACT_KEYS)[number];

export type ProgrammeFact = {
  key: FactKey;
  label: string;
  /** Real value, or null when the college hasn't supplied it. */
  value: string | null;
  /** `on-request` = deliberately not published (fees); `pending` = still to be supplied. */
  state: "provided" | "on-request" | "pending";
};

/** What the college must supply per fact (surfaced in content/TODO-content.md). */
export const FACT_INPUT_NEEDED: Record<FactKey, string> = {
  awardingInstitution: needsInput("awarding institution / body for this programme"),
  recognition: needsInput("verified recognition or accreditation status of this programme"),
  entryRequirements: needsInput("the programme-specific entry requirements"),
  fees: needsInput("published fee structure (or confirmation that fees are on request only)"),
  duration: needsInput("the actual programme duration"),
  deliveryMode: needsInput("delivery mode / medium"),
  nextIntake: needsInput("next intake date"),
};

const GENERIC_DURATION = /^as per programme structure$/i;

export const FACT_LABELS: Record<FactKey, string> = {
  awardingInstitution: "Awarding institution",
  recognition: "Recognition & accreditation",
  entryRequirements: "Entry requirements",
  fees: "Fees",
  duration: "Duration",
  deliveryMode: "Delivery mode",
  nextIntake: "Next intake",
};

export function getProgrammeFacts(p: Programme): Record<FactKey, ProgrammeFact> {
  const fact = (key: FactKey, value: string | undefined | null, state?: ProgrammeFact["state"]): ProgrammeFact => {
    const real = clientValue(value ?? undefined) ?? null;
    return { key, label: FACT_LABELS[key], value: real, state: state ?? (real ? "provided" : "pending") };
  };

  const feeParts = p.fees
    ? [p.fees.courseFee && `Course fee ${p.fees.courseFee}`, p.fees.registrationFee && `Registration ${p.fees.registrationFee}`]
        .filter(Boolean)
        .join(" · ")
    : "";

  return {
    awardingInstitution: fact("awardingInstitution", p.awardingInstitution),
    recognition: fact("recognition", p.recognition),
    entryRequirements: fact("entryRequirements", p.entryRequirements.length ? "See entry requirements below" : null),
    fees: feeParts ? fact("fees", feeParts) : fact("fees", null, "on-request"),
    duration: fact("duration", GENERIC_DURATION.test(p.duration.trim()) ? null : p.duration),
    deliveryMode: fact("deliveryMode", [p.mode, p.medium && `${p.medium} medium`].filter(Boolean).join(" · ")),
    nextIntake: fact("nextIntake", [p.intake, p.applicationDeadline && `apply by ${p.applicationDeadline}`].filter(Boolean).join(" · ")),
  };
}

const norm = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

/** True when the outcomes are the shared placeholder list (see programmes-seed). */
export function isGenericLearningOutcomes(outcomes: readonly string[]): boolean {
  return outcomes.length === DEFAULT_LEARNING_OUTCOMES.length && outcomes.every((o, i) => norm(o) === norm(DEFAULT_LEARNING_OUTCOMES[i]));
}

/** "Why this programme" adds nothing when it just repeats the overview. */
export function repeatsOverview(p: Pick<Programme, "overview" | "whyThisProgramme">): boolean {
  return norm(p.overview) === norm(p.whyThisProgramme);
}
