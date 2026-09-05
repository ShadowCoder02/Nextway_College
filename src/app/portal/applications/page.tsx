import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { ApplicationsManager } from "@/components/admin/ApplicationsManager";

export const metadata = {
  title: "Applications Management | Portal",
};

export default async function PortalApplicationsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Student Applications</h1>
          <p className="text-slate text-sm">Review, verify credentials, and manage admission decisions for 2026 intake</p>
        </div>
      </div>

      <ApplicationsManager />
    </AdminShell>
  );
}
