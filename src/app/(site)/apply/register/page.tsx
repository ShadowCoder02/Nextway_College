import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { RegisterForm } from "./RegisterForm";

export const metadata = buildMetadata({
  title: "Create Applicant Account",
  description: "Register for the Nextway College International applicant portal to start your online application.",
  path: "/apply/register",
  noindex: true,
});

export default function ApplicantRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
