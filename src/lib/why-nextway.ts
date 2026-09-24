import { whyNextWay } from "@/data/content";
import { getPublicApprovals } from "@/constants/approvals";

/**
 * The "why us" grid, minus items that would be redundant or unsubstantiated
 * on a given page:
 * - "hybrid" always drops out: every page that shows this grid also shows
 *   HybridLearningSection (its own full section) elsewhere on the same page,
 *   so repeating the same claim as a plain card is redundant.
 * - "accreditation" only shows once the college has supplied at least one
 *   verified partner description (see src/constants/approvals.ts) - a card
 *   claiming "accredited partnerships" with zero evidence anywhere on the
 *   page is exactly the unsubstantiated claim this site avoids elsewhere.
 *
 * Used by both the homepage and /about so the two can never drift out of
 * sync on this again.
 */
export function getWhyNextWayItems() {
  const hasApprovals = getPublicApprovals().length > 0;
  return whyNextWay.filter((item) => item.id !== "hybrid" && (item.id !== "accreditation" || hasApprovals));
}
