import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  heading: string;
  body?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-ice p-8 text-center sm:p-10">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-bold text-navy">{heading}</h3>
      {body && <div className="mx-auto max-w-md text-sm text-slate">{body}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type ActiveFilter = { label: string; onRemove: () => void };

type FilterEmptyStateProps = {
  activeFilters: ActiveFilter[];
  onClearAll: () => void;
  heading?: string;
};

/** The filter variant: lists active filters so the user understands why they
 * see nothing, plus a "Clear all filters" action. */
export function FilterEmptyState({ activeFilters, onClearAll, heading = "No results match your filters" }: FilterEmptyStateProps) {
  return (
    <EmptyState
      heading={heading}
      body={
        activeFilters.length > 0 ? (
          <div>
            <p className="mb-3">Currently filtering by:</p>
            <ul className="mb-1 flex flex-wrap justify-center gap-2">
              {activeFilters.map((filter) => (
                <li key={filter.label}>
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate/30 bg-white px-3 py-1 text-xs font-medium text-charcoal transition hover:border-brand-red hover:text-brand-red"
                  >
                    {filter.label}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          "Try adjusting your search."
        )
      }
      action={
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-bold text-brand-red underline underline-offset-2 hover:text-brand-red/80"
        >
          Clear all filters
        </button>
      }
    />
  );
}
