import { buildMetadata } from "@/lib/seo";
import { DashboardClient } from "./DashboardClient";

export const metadata = buildMetadata({
  title: "Applicant Dashboard",
  description: "Track your Nextway College International application status, documents and admission progress.",
  path: "/apply/portal",
  noindex: true,
});

export default function ApplicantDashboardPage() {
  return <DashboardClient />;
}
