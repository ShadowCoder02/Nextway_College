"use client";

import { useEffect, useState } from "react";
import type { CareerVacancy } from "@/types";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-fetch";

const emptyCareer = (): CareerVacancy => ({
  id: "",
  title: "",
  slug: "",
  department: "",
  location: "Island-wide branches",
  type: "Full-time",
  description: "",
  requirements: [],
  status: "published",
  postedAt: new Date().toISOString().slice(0, 10),
});

export function CareersManager() {
  const [careers, setCareers] = useState<CareerVacancy[]>([]);
  const [editing, setEditing] = useState<CareerVacancy | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await apiFetch("/api/portal/careers");
    const data = await res.json();
    setCareers(data.careers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    const payload = {
      ...editing,
      requirements: editing.requirements.filter(Boolean),
    };

    if (editing.id && careers.some((c) => c.id === editing.id)) {
      await apiFetch(`/api/portal/careers/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch("/api/portal/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this vacancy?")) return;
    await apiFetch(`/api/portal/careers/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate">Loading careers...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Careers</h1>
          <p className="text-slate">Manage job vacancies displayed on the public careers page.</p>
        </div>
        <Button variant="primary" onClick={() => setEditing(emptyCareer())}>
          Add vacancy
        </Button>
      </div>

      {editing && (
        <div className="premium-card space-y-4 p-6">
          <h2 className="text-lg font-bold">{editing.id ? "Edit vacancy" : "New vacancy"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Job title
              <input
                className="input-premium mt-1"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Department
              <input
                className="input-premium mt-1"
                value={editing.department}
                onChange={(e) => setEditing({ ...editing, department: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Location
              <input
                className="input-premium mt-1"
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Type
              <input
                className="input-premium mt-1"
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Description
              <textarea
                className="input-premium mt-1 min-h-24"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Requirements (one per line)
              <textarea
                className="input-premium mt-1 min-h-24"
                value={editing.requirements.join("\n")}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    requirements: e.target.value.split("\n").map((s) => s.trim()),
                  })
                }
              />
            </label>
            <label className="block text-sm">
              Status
              <select
                className="input-premium mt-1"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as CareerVacancy["status"] })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={save}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="premium-card overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-ice text-slate">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {careers.map((career) => (
              <tr key={career.id} className="border-b border-ice">
                <td className="px-4 py-3 font-medium">{career.title}</td>
                <td className="px-4 py-3">{career.department}</td>
                <td className="px-4 py-3">{career.location}</td>
                <td className="px-4 py-3 capitalize">{career.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-red"
                      onClick={() => setEditing(career)}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-error" onClick={() => remove(career.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
