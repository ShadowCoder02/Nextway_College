import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProgrammesManager } from "@/components/admin/ProgrammesManager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminProgrammesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold text-navy">Programmes</h1>
      <p className="mb-8 text-slate">Add, edit or remove courses shown on the public website</p>
      <div className="premium-card p-6">
        <ProgrammesManager />
      </div>
    </AdminShell>
  );
}
