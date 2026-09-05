import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { getApplicationByIdAdmin } from "@/services/admissions";
import { ApplicationReviewer } from "@/components/admin/ApplicationReviewer";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Application Review | Portal",
};

export default async function PortalApplicationDetailPage({ params }: PageProps) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  const { id } = await params;
  const application = await getApplicationByIdAdmin(id);
  if (!application) notFound();

  return (
    <AdminShell>
      <ApplicationReviewer initialApplication={application} />
    </AdminShell>
  );
}
