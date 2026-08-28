import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventsManager } from "@/components/admin/EventsManager";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminEventsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  return (
    <AdminShell>
      <h1 className="mb-2 text-2xl font-bold text-navy">Events</h1>
      <p className="mb-8 text-slate">Manage open days, information sessions and campus events</p>
      <div className="premium-card p-6">
        <EventsManager />
      </div>
    </AdminShell>
  );
}
