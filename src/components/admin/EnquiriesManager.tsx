"use client";

import { useEffect, useState } from "react";
import type { StoredEnquiry } from "@/services/enquiries";
import { formatDate } from "@/lib/utils";

const STATUSES = ["new", "contacted", "follow_up", "converted", "closed"] as const;

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<StoredEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/portal/enquiries");
    const data = await res.json();
    setEnquiries(data.enquiries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: StoredEnquiry["status"]) {
    await fetch("/api/portal/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  if (loading) return <p className="text-slate">Loading enquiries...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ice text-slate">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Programme</th>
            <th className="px-3 py-2">Message</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((e) => (
            <tr key={e.id} className="border-b border-ice align-top">
              <td className="px-3 py-3 text-slate">
                {formatDate(e.created_at)}
              </td>
              <td className="px-3 py-3 font-medium">{e.full_name}</td>
              <td className="px-3 py-3">{e.phone}</td>
              <td className="px-3 py-3">{e.email}</td>
              <td className="px-3 py-3">{e.programme_title ?? "—"}</td>
              <td className="max-w-xs px-3 py-3 text-slate">{e.message ?? "—"}</td>
              <td className="px-3 py-3">
                <select
                  value={e.status}
                  onChange={(ev) => updateStatus(e.id, ev.target.value as StoredEnquiry["status"])}
                  className="input-premium py-2 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {enquiries.length === 0 && <p className="py-8 text-center text-slate">No enquiries yet.</p>}
    </div>
  );
}
