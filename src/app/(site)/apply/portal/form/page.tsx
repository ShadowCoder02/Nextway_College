import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { ApplicationFormClient } from "./ApplicationFormClient";

export const metadata = buildMetadata({
  title: "Application Form",
  description: "Complete your Nextway College International application: personal details, qualifications, programme choice and documents.",
  path: "/apply/portal/form",
  noindex: true,
});

export default function ApplicationFormPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationFormClient />
    </Suspense>
  );
}
