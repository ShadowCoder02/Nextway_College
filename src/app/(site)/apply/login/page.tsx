import { buildMetadata } from "@/lib/seo";
import { slugParam } from "@/lib/url-params";
import { LoginForm } from "./LoginForm";

export const metadata = buildMetadata({
  title: "Applicant Sign In",
  description: "Sign in to your Nextway College International applicant account to continue your application.",
  path: "/apply/login",
  noindex: true,
});

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ApplicantLoginPage({ searchParams }: PageProps) {
  const { programme } = await searchParams;
  return <LoginForm programmeSlug={slugParam(programme)} />;
}
