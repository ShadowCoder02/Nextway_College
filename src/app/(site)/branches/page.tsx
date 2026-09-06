import { PageHero } from "@/components/ui/PageHero";
import { BranchFinder } from "@/components/branches/BranchFinder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
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
      <Breadcrumbs items={[{ label: "Find a Branch", href: "/branches" }]} />
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
