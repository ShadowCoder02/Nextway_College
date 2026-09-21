import { buildMetadata } from "@/lib/seo";
import { tokenParam } from "@/lib/url-params";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Set a new password for your Nextway College International applicant account.",
  path: "/apply/reset-password",
  noindex: true,
});

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={tokenParam(token) ?? ""} />;
}
