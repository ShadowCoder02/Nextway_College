import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminEnquiriesPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin/login");

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold text-navy">Enquiries & Applications</h1>
      <p className="mb-8 text-slate">Review and update enquiry status from website forms</p>
      <div className="premium-card p-6">
        <EnquiriesManager />
      </div>
    </AdminShell>
  );
}
