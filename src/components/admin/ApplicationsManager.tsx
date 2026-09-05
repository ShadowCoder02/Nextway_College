"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { StudentApplication, ApplicationStatus } from "@/types/admissions";
import type { Programme } from "@/types";
import { formatDate } from "@/lib/utils";

export function ApplicationsManager() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [progFilter, setProgFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (progFilter !== "ALL") params.set("programmeId", progFilter);
      params.set("page", page.toString());
      params.set("pageSize", "12");

      const res = await fetch(`/api/portal/applications?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setApplications(data.applications || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, progFilter, page]);

  useEffect(() => {
    async function loadProgrammes() {
      try {
        const res = await fetch("/api/portal/programmes");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setProgrammes(data);
        }
      } catch {
        // ignore
      }
    }
    loadProgrammes();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  function getStatusPill(status: ApplicationStatus) {
    switch (status) {
      case "DRAFT":
        return <span className="rounded-full bg-slate/15 px-2.5 py-1 text-xs font-semibold text-slate">Draft</span>;
      case "SUBMITTED":
        return <span className="rounded-full bg-navy/15 px-2.5 py-1 text-xs font-bold text-navy">Submitted</span>;
      case "UNDER_REVIEW":
        return <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-bold text-navy">Under Review</span>;
      case "DOCUMENTS_REQUIRED":
        return <span className="rounded-full bg-brand-red/15 px-2.5 py-1 text-xs font-bold text-brand-red">Docs Required</span>;
      case "INTERVIEW_SCHEDULED":
        return <span className="rounded-full bg-navy text-white px-2.5 py-1 text-xs font-semibold">Interview</span>;
      case "APPROVED":
        return <span className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-success">✓ Approved</span>;
      case "REJECTED":
        return <span className="rounded-full bg-error/15 px-2.5 py-1 text-xs font-semibold text-error">Rejected</span>;
      default:
        return <span className="rounded-full bg-ice px-2.5 py-1 text-xs font-semibold">{status.replace(/_/g, " ")}</span>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <input
            type="text"
            className="input-premium text-xs"
            placeholder="Search by Name, Email, App #, NIC..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            className="rounded-lg border border-slate/20 bg-white px-3 py-2 text-xs text-navy focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DOCUMENTS_REQUIRED">Documents Required</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            className="rounded-lg border border-slate/20 bg-white px-3 py-2 text-xs text-navy focus:outline-none max-w-xs truncate"
            value={progFilter}
            onChange={(e) => {
              setProgFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Programmes</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Application #</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Programme</th>
                <th className="px-4 py-3 font-semibold">Intake</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ice">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate">
                    No applications match the current filters.
                  </td>
                </tr>
              ) : (
                applications.map((a) => (
                  <tr key={a.id} className="hover:bg-ice/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-navy">
                      <Link href={`/portal/applications/${a.id}`} className="hover:text-brand-red">
                        {a.applicationNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-navy">{a.personalInfo?.fullName || "—"}</div>
                      <div className="text-[11px] text-slate">{a.personalInfo?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {a.programmeChoice?.programmeTitle || "General / Unselected"}
                    </td>
                    <td className="px-4 py-3 text-slate">{a.programmeChoice?.intake || "—"}</td>
                    <td className="px-4 py-3 text-slate">
                      {a.submittedAt ? formatDate(a.submittedAt) : "Draft"}
                    </td>
                    <td className="px-4 py-3">{getStatusPill(a.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/portal/applications/${a.id}`}
                        className="rounded-lg bg-navy px-3 py-1.5 font-bold text-white hover:bg-gold hover:text-navy transition"
                      >
                        Review Dossier →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-ice px-4 py-3 text-xs text-slate">
          <span>
            Total: <strong>{totalCount}</strong> applications
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate/20 px-2 py-1 hover:bg-ice disabled:opacity-40"
            >
              Previous
            </button>
            <span className="py-1">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate/20 px-2 py-1 hover:bg-ice disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
