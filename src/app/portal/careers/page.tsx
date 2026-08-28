import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CareersManager } from "@/components/admin/CareersManager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function PortalCareersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  return (
    <AdminShell>
      <CareersManager />
    </AdminShell>
  );
}
