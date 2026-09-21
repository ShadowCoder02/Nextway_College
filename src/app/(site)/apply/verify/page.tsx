import { buildMetadata } from "@/lib/seo";
import { emailParam, otpParam, slugParam } from "@/lib/url-params";
import { VerifyForm } from "./VerifyForm";

export const metadata = buildMetadata({
  title: "Verify Your Account",
  description: "Verify your email address to activate your Nextway College International applicant account.",
  path: "/apply/verify",
  noindex: true,
});

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ApplicantVerifyPage({ searchParams }: PageProps) {
  const { email, otp, programme } = await searchParams;
  return <VerifyForm defaultEmail={emailParam(email)} defaultOtp={otpParam(otp)} programmeSlug={slugParam(programme)} />;
}
