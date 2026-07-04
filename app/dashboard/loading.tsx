/**
 * Dashboard-level loading UI. Renders while any /dashboard/* Server
 * Component or async data is streaming. Kept minimal (no external images,
 * no motion library) so it shows up instantly.
 */

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-56 bg-muted/40 rounded-lg" />
          <div className="h-4 w-72 bg-muted/30 rounded" />
        </div>

        {/* Row 1 — full-width card skeleton */}
        <div className="h-40 bg-muted/20 rounded-2xl border border-border" />

        {/* Row 2 — 4 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/20 rounded-2xl border border-border" />
          ))}
        </div>

        {/* Row 3 — 7/5 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-72 bg-muted/20 rounded-2xl border border-border" />
          <div className="lg:col-span-5 h-72 bg-muted/20 rounded-2xl border border-border" />
        </div>
      </div>
    </div>
  )
}
