import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { VerifyForm } from "./VerifyForm";

export const metadata = buildMetadata({
  title: "Verify Your Account",
  description: "Verify your email address to activate your Nextway College International applicant account.",
  path: "/apply/verify",
  noindex: true,
});

export default function ApplicantVerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
