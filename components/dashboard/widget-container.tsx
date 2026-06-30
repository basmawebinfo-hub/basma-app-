"use client"

/**
 * WidgetContainer — the building block every dashboard widget composes.
 *
 * Why this exists:
 *   - One Design System for all widgets. No more "every card looks slightly
 *     different" entropy as we add more widgets.
 *   - Built-in handling for the 4 states every data widget needs:
 *     loading, empty, error, content.
 *   - Header slot for title + optional actions (filter buttons, "view all" link).
 *   - All widgets get the same hover/border/padding/radius tokens.
 *
 * Usage:
 *
 *     <WidgetContainer
 *       title="Usage"
 *       description="استخدامك هذا الشهر"
 *       icon={Activity}
 *       action={<Link href="/billing">عرض التفاصيل</Link>}
 *       state={isLoading ? "loading" : data ? "content" : "empty"}
 *       empty={{ title: "لا يوجد استخدام بعد", action: <Button>...</Button> }}
 *     >
 *       <YourContent />
 *     </WidgetContainer>
 *
 * Constraints (intentional):
 *   - Header is ALWAYS visible — even during loading. The skeleton lives in
 *     the body only. This avoids title-pop CLS.
 *   - Empty state body is centered vertically + horizontally with a fixed
 *     min-height so widgets in a grid row are visually equal.
 *   - Error state is rendered identically across widgets — one error doesn't
 *     blow up the rest of the page.
 */

import { type LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type WidgetState = "loading" | "empty" | "error" | "content"

export type WidgetEmptyConfig = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export type WidgetErrorConfig = {
  title?: string
  description?: string
  retry?: () => void
  retryLabel?: string
}

type Props = {
  /** Top-line label for the widget */
  title: string
  /** Short secondary copy under the title */
  description?: string
  /** Optional icon shown left of the title */
  icon?: LucideIcon
  /** Optional element shown in the header far-end (filter, view-all link, etc.) */
  action?: ReactNode
  /** Current data state — drives which body variant renders */
  state?: WidgetState
  /** Configuration for the empty body */
  empty?: WidgetEmptyConfig
  /** Configuration for the error body */
  error?: WidgetErrorConfig
  /** Content body — rendered when state is "content" */
  children?: ReactNode
  /** Extra classes for the root card */
  className?: string
  /** Min-height for visual row alignment (default 200px). Set to 0 to disable. */
  minBodyHeight?: number
}

export function WidgetContainer({
  title,
  description,
  icon: Icon,
  action,
  state = "content",
  empty,
  error,
  children,
  className,
  minBodyHeight = 200,
}: Props) {
  return (
    <section
      className={cn(
        "bg-card border border-border rounded-2xl overflow-hidden",
        "transition-colors duration-150 hover:border-primary/20",
        "flex flex-col",
        className,
      )}
      aria-busy={state === "loading"}
    >
      {/* Header — always visible */}
      <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border/60">
        <div className="min-w-0 flex items-start gap-3">
          {Icon && (
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      {/* Body */}
      <div
        className="flex-1 flex"
        style={minBodyHeight > 0 ? { minHeight: minBodyHeight } : undefined}
      >
        {state === "loading" && <WidgetLoading />}
        {state === "empty" && <WidgetEmpty config={empty} />}
        {state === "error" && <WidgetError config={error} />}
        {state === "content" && (
          <div className="flex-1 w-full">{children}</div>
        )}
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// Internal sub-states (kept private so all widgets look identical)
// ────────────────────────────────────────────────────────────

function WidgetLoading() {
  return (
    <div className="flex-1 w-full p-5 space-y-3 animate-pulse">
      <div className="h-3 w-2/3 rounded-md bg-secondary" />
      <div className="h-3 w-1/2 rounded-md bg-secondary" />
      <div className="h-24 w-full rounded-xl bg-secondary mt-4" />
    </div>
  )
}

function WidgetEmpty({ config }: { config?: WidgetEmptyConfig }) {
  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-5">
        —
      </div>
    )
  }
  const Icon = config.icon
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-8 gap-3">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground/60" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{config.title}</p>
        {config.description && (
          <p className="text-xs text-muted-foreground max-w-xs">
            {config.description}
          </p>
        )}
      </div>
      {config.action && <div className="mt-2">{config.action}</div>}
    </div>
  )
}

function WidgetError({ config }: { config?: WidgetErrorConfig }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-8 gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {config?.title ?? "حصل خطأ"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {config?.description ?? "حاول تاني بعد لحظات"}
        </p>
      </div>
      {config?.retry && (
        <button
          type="button"
          onClick={config.retry}
          className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-4"
        >
          {config.retryLabel ?? "إعادة المحاولة"}
        </button>
      )}
    </div>
  )
}
