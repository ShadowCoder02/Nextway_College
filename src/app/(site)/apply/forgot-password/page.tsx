import { buildMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Nextway College International applicant account password.",
  path: "/apply/forgot-password",
  noindex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
