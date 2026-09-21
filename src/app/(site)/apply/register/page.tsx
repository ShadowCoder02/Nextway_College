import { buildMetadata } from "@/lib/seo";
import { slugParam } from "@/lib/url-params";
import { RegisterForm } from "./RegisterForm";

export const metadata = buildMetadata({
  title: "Create Applicant Account",
  description: "Register for the Nextway College International applicant portal to start your online application.",
  path: "/apply/register",
  noindex: true,
});

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ApplicantRegisterPage({ searchParams }: PageProps) {
  const { programme } = await searchParams;
  return <RegisterForm programmeSlug={slugParam(programme)} />;
}
