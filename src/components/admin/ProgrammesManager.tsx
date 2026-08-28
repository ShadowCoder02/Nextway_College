"use client";

import { useEffect, useState } from "react";
import type { Programme } from "@/types";
import { Button } from "@/components/ui/Button";
import { IMAGES } from "@/constants/images";
import { PROGRAMME_LEVELS, STUDY_MODES } from "@/constants/site";

const emptyProgramme = (): Programme => ({
  id: "",
  schoolId: "sch-computing",
  schoolSlug: "computing-it",
  schoolName: "School of Computing & IT",
  title: "",
  slug: "",
  level: "Diploma",
  duration: "1 year",
  mode: "Hybrid",
  medium: "English & Tamil",
  intake: "2026 Intake",
  location: "All island — 22 branches",
  overview: "",
  whyThisProgramme: "",
  learningOutcomes: [],
  entryRequirements: [],
  assessment: "",
  careerOpportunities: [],
  progression: "",
  faqs: [],
  imageUrl: IMAGES.campus,
  featured: false,
  status: "published",
  modules: [],
  shortPitch: "",
});

export function ProgrammesManager() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/portal/programmes");
    const data = await res.json();
    setProgrammes(data.programmes ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    const slug =
      editing.slug ||
      editing.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = { ...editing, slug };

    if (editing.id && programmes.some((p) => p.id === editing.id)) {
      await fetch(`/api/portal/programmes/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/portal/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this programme?")) return;
    await fetch(`/api/portal/programmes/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate">Loading programmes...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={() => setEditing(emptyProgramme())}>
          + Add programme
        </Button>
      </div>

      {editing && (
        <div className="premium-card space-y-4 p-6">
          <h3 className="font-bold text-navy">{editing.id ? "Edit programme" : "New programme"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input-premium"
              placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <input
              className="input-premium"
              placeholder="Slug (auto if empty)"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            />
            <select
              className="input-premium"
              value={editing.level}
              onChange={(e) =>
                setEditing({ ...editing, level: e.target.value as Programme["level"] })
              }
            >
              {PROGRAMME_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              className="input-premium"
              value={editing.mode}
              onChange={(e) =>
                setEditing({ ...editing, mode: e.target.value as Programme["mode"] })
              }
            >
              {STUDY_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              className="input-premium"
              placeholder="Duration"
              value={editing.duration}
              onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
            />
            <input
              className="input-premium"
              placeholder="Location"
              value={editing.location}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            />
          </div>
          <textarea
            className="input-premium min-h-24"
            placeholder="Short pitch"
            value={editing.shortPitch}
            onChange={(e) => setEditing({ ...editing, shortPitch: e.target.value })}
          />
          <textarea
            className="input-premium min-h-32"
            placeholder="Overview"
            value={editing.overview}
            onChange={(e) => setEditing({ ...editing, overview: e.target.value })}
          />
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.flagship}
                onChange={(e) => setEditing({ ...editing, flagship: e.target.checked })}
              />
              Flagship
            </label>
            <select
              className="input-premium w-auto py-2"
              value={editing.status}
              onChange={(e) =>
                setEditing({ ...editing, status: e.target.value as Programme["status"] })
              }
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="sm" onClick={save}>
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-ice text-slate">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Level</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programmes.map((p) => (
              <tr key={p.id} className="border-b border-ice">
                <td className="px-3 py-3 font-medium">{p.title}</td>
                <td className="px-3 py-3">{p.level}</td>
                <td className="px-3 py-3 capitalize">{p.status}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-red hover:underline"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-error hover:underline"
                      onClick={() => remove(p.id)}
                    >
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
