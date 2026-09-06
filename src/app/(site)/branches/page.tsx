import { PageHero } from "@/components/ui/PageHero";
import { BranchFinder } from "@/components/branches/BranchFinder";
import { buildMetadata } from "@/lib/seo";
import { BRANCHES } from "@/data/branches";

export const metadata = buildMetadata({
  title: "Find a Branch",
  description: "Search Nextway College International's branches across Sri Lanka for addresses, phone numbers and hours.",
  path: "/branches",
});

export default function BranchesPage() {
  return (
    <>
      <PageHero
        eyebrow="Island-wide presence"
        title="Find a Branch"
        description="Search our branch network across Sri Lanka for contact details and directions."
      />

      <section className="py-12 lg:py-16">
        <div className="container-nwc">
          <BranchFinder branches={BRANCHES} />
        </div>
      </section>
    </>
  );
}
