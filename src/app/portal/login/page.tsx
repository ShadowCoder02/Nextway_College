import { buildMetadata } from "@/lib/seo";
import { PortalLoginClient } from "./PortalLoginClient";

export const metadata = buildMetadata({
  title: "Staff Portal Login",
  description: "Sign in to the Nextway College International staff management portal.",
  path: "/portal/login",
  noindex: true,
});

export default function PortalLoginPage() {
  return <PortalLoginClient />;
}
