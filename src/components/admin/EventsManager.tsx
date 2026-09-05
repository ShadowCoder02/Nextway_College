"use client";

import { useEffect, useState } from "react";
import type { EventItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

const emptyEvent = (): EventItem => ({
  id: "",
  title: "",
  slug: "",
  summary: "",
  description: "",
  startAt: new Date().toISOString(),
  location: "Kandy Campus",
  imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
  status: "published",
});

export function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/portal/events");
    const data = await res.json();
    setEvents(data.events ?? []);
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

    if (editing.id && events.some((e) => e.id === editing.id)) {
      await fetch(`/api/portal/events/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/portal/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/portal/events/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-slate">Loading events...</p>;

  return (
    <div className="space-y-6">
      <Button variant="primary" size="sm" onClick={() => setEditing(emptyEvent())}>
        + Add event
      </Button>

      {editing && (
        <div className="premium-card space-y-4 p-6">
          <h3 className="font-bold text-navy">{editing.id ? "Edit event" : "New event"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input-premium"
              placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <input
              className="input-premium"
              type="datetime-local"
              value={editing.startAt.slice(0, 16)}
              onChange={(e) =>
                setEditing({ ...editing, startAt: new Date(e.target.value).toISOString() })
              }
            />
            <input
              className="input-premium md:col-span-2"
              placeholder="Location"
              value={editing.location}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            />
          </div>
          <textarea
            className="input-premium min-h-20"
            placeholder="Summary"
            value={editing.summary}
            onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
          />
          <textarea
            className="input-premium min-h-28"
            placeholder="Description"
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <select
            className="input-premium w-auto py-2"
            value={editing.status}
            onChange={(e) =>
              setEditing({ ...editing, status: e.target.value as EventItem["status"] })
            }
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ice text-slate">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-ice">
                <td className="px-3 py-3 font-medium">{e.title}</td>
                <td className="px-3 py-3 text-slate">
                  {formatDateTime(e.startAt)}
                </td>
                <td className="px-3 py-3 capitalize">{e.status}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-brand-red hover:underline"
                      onClick={() => setEditing(e)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-error hover:underline"
                      onClick={() => remove(e.id)}
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
