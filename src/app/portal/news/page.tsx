import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewsManager } from "@/components/admin/NewsManager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function PortalNewsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  return (
    <AdminShell>
      <NewsManager />
    </AdminShell>
  );
}
