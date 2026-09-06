import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "./LoginForm";

export const metadata = buildMetadata({
  title: "Applicant Sign In",
  description: "Sign in to your Nextway College International applicant account to continue your application.",
  path: "/apply/login",
  noindex: true,
});

export default function ApplicantLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
