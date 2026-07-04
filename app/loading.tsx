/**
 * Root-level loading UI. Shows briefly while the landing shell or any
 * public page is streaming. Neutral single spinner — the landing page
 * itself owns its rich transitions.
 */

export default function PublicLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm">Loading\u2026</span>
      </div>
    </div>
  )
}
