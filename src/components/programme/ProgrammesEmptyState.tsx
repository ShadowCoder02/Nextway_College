"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterEmptyState } from "@/components/ui/EmptyState";

type ProgrammesEmptyStateProps = {
  schools: { slug: string; name: string }[];
};

export function ProgrammesEmptyState({ schools }: ProgrammesEmptyStateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const level = searchParams.get("level") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const school = searchParams.get("school") ?? "";
  const schoolName = schools.find((s) => s.slug === school)?.name ?? school;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/programmes?${params.toString()}`);
  }

  const activeFilters = [
    q ? { label: `Search: "${q}"`, onRemove: () => removeFilter("q") } : null,
    level ? { label: level, onRemove: () => removeFilter("level") } : null,
    mode ? { label: mode, onRemove: () => removeFilter("mode") } : null,
    school ? { label: schoolName, onRemove: () => removeFilter("school") } : null,
  ].filter((f): f is { label: string; onRemove: () => void } => f !== null);

  return (
    <FilterEmptyState
      heading="No programmes match your filters"
      activeFilters={activeFilters}
      onClearAll={() => router.push("/programmes")}
    />
  );
}
