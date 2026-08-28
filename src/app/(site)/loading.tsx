export default function SiteLoading() {
  return (
    <div className="container-nwc py-10">
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded-md bg-navy/10" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded-md bg-navy/10" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-md bg-navy/10" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-card bg-navy/10" />
        ))}
      </div>
    </div>
  );
}
