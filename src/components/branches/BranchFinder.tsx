"use client";

import { useState } from "react";
import type { Branch } from "@/data/branches";
import { EmptyState } from "@/components/ui/EmptyState";
import { SITE } from "@/constants/site";

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="premium-card p-6">
      <h3 className="mb-3 font-heading text-lg font-bold text-navy">{branch.name}</h3>
      <dl className="space-y-2 text-sm text-charcoal">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate">Address</dt>
          <dd>{branch.address ?? <span className="italic text-slate">To be confirmed</span>}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate">Phone</dt>
          <dd>
            {branch.phone ? (
              <a href={`tel:${branch.phone}`} className="text-brand-red hover:underline">
                {branch.phone}
              </a>
            ) : (
              <span className="italic text-slate">To be confirmed</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate">Hours</dt>
          <dd>{branch.hours ?? <span className="italic text-slate">To be confirmed</span>}</dd>
        </div>
      </dl>
      {branch.address ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-bold text-navy underline underline-offset-2 hover:text-brand-red"
        >
          Get directions →
        </a>
      ) : (
        <p className="mt-4 text-xs text-slate">
          Directions available once the branch address is confirmed. Call {SITE.phone} for details.
        </p>
      )}
    </article>
  );
}

export function BranchFinder({ branches }: { branches: Branch[] }) {
  const [query, setQuery] = useState("");

  const filtered = branches.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div>
      <div className="mb-8 rounded-[var(--radius-card)] bg-ice p-6">
        {/* Placeholder map: no real coordinates exist for any branch yet
            (see content/TODO-content.md) — a fabricated pin/embed would
            imply precision that isn't there. */}
        <div className="mb-6 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-slate/30 bg-white text-center sm:h-64">
          <p className="max-w-sm px-4 text-sm text-slate">
            Interactive branch map coming soon — once branch addresses are confirmed, they&apos;ll be
            plotted here.
          </p>
        </div>
        <label htmlFor="branch-search" className="mb-1 block text-sm font-medium">
          Search branches
        </label>
        <input
          id="branch-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by town name..."
          className="w-full rounded-lg border border-slate/30 bg-white px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red sm:max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          heading="No branches match your search"
          body="Try a different town name, or call us to find your nearest branch."
          action={
            <a href={`tel:${SITE.phoneTel}`} className="text-sm font-bold text-brand-red hover:underline">
              Call {SITE.phone}
            </a>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((branch) => (
            <BranchCard key={branch.slug} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}
