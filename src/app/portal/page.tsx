import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { getEnquiries } from "@/services/enquiries";
import { getAllProgrammesAdmin } from "@/services/programmes";
import { getAllEventsAdmin } from "@/services/events";
import { getAllNewsAdmin } from "@/services/news";
import { getAllCareersAdmin } from "@/services/careers";
import { getAllApplicationsAdmin } from "@/services/admissions";

export default async function PortalDashboardPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/portal/login");

  const [applicationsData, enquiries, programmes, events, news, careers] = await Promise.all([
    getAllApplicationsAdmin({ pageSize: 5 }),
    getEnquiries(),
    getAllProgrammesAdmin(),
    getAllEventsAdmin(),
    getAllNewsAdmin(),
    getAllCareersAdmin(),
  ]);

  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const pendingApps = applicationsData.applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW",
  ).length;

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-slate">Welcome to the Nextway College International management portal</p>
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Student Applications", value: applicationsData.total, href: "/portal/applications", accent: "text-brand-red" },
          { label: "Pending App Reviews", value: pendingApps, href: "/portal/applications", accent: "text-gold-text" },
          { label: "New enquiries", value: newEnquiries, href: "/portal/enquiries", accent: "text-navy" },
          { label: "Programmes", value: programmes.length, href: "/portal/programmes", accent: "text-navy" },
          { label: "News articles", value: news.length, href: "/portal/news", accent: "text-navy" },
          { label: "Events & Open Days", value: events.length, href: "/portal/events", accent: "text-navy" },
          { label: "Career vacancies", value: careers.length, href: "/portal/careers", accent: "text-navy" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="premium-card block p-6 transition hover:-translate-y-1"
          >
            <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
            <p className="text-sm text-slate">{stat.label}</p>
          </Link>
        ))}
      </div>

      <section className="premium-card p-6 mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Recent Student Applications</h2>
          <Link href="/portal/applications" className="text-sm font-semibold text-brand-red">
            View all applications →
          </Link>
        </div>
        {applicationsData.applications.length === 0 ? (
          <p className="text-slate text-sm">No applications submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ice text-slate text-xs">
                  <th className="px-3 py-2">App #</th>
                  <th className="px-3 py-2">Applicant</th>
                  <th className="px-3 py-2">Programme</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicationsData.applications.slice(0, 5).map((a) => (
                  <tr key={a.id} className="border-b border-ice text-xs">
                    <td className="px-3 py-3 font-mono font-bold text-navy">{a.applicationNumber}</td>
                    <td className="px-3 py-3 font-medium">{a.personalInfo?.fullName || "—"}</td>
                    <td className="px-3 py-3">{a.programmeChoice?.programmeTitle || "General"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-ice px-2.5 py-1 text-[11px] font-semibold">
                        {a.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/portal/applications/${a.id}`}
                        className="font-bold text-navy hover:text-brand-red"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="premium-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Recent enquiries</h2>
          <Link href="/portal/enquiries" className="text-sm font-semibold text-brand-red">
            View all →
          </Link>
        </div>
        {enquiries.length === 0 ? (
          <p className="text-slate">No enquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ice text-slate">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Programme</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-b border-ice">
                    <td className="px-3 py-3 font-medium">{e.full_name}</td>
                    <td className="px-3 py-3 text-slate">{e.email}</td>
                    <td className="px-3 py-3">{e.programme_title ?? "General"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-ice px-2.5 py-1 text-xs font-semibold capitalize">
                        {e.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
