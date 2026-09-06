import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Set a new password for your Nextway College International applicant account.",
  path: "/apply/reset-password",
  noindex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
