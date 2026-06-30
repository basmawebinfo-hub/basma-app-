"use client"

/**
 * Usage Widget — shows the user's consumption against their plan limits.
 *
 * Three sub-stats laid out as a horizontal-on-desktop / vertical-on-mobile
 * row inside the unified WidgetContainer chrome:
 *   1. Messages this period      (X / Y, with monthly cap)
 *   2. Active WhatsApp numbers   (X / Y, with plan cap)
 *   3. API calls today            (X — no cap shown until we add daily limits)
 *
 * Loading state defers to WidgetContainer's built-in skeleton.
 * Empty state (no subscription / no data) routes to WidgetContainer's empty.
 *
 * Source: /api/dashboard/usage
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, ArrowUpRight, Gauge } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { WidgetContainer } from "./widget-container"

type Usage = {
  messages: { used: number; limit: number | null }
  numbers:  { used: number; limit: number | null }
  apiToday: { used: number; limit: number | null }
  period:   { endsAt: string | null }
}

export function UsageWidget() {
  const { t, lang } = useI18n()
  const [data, setData] = useState<Usage | null>(null)
  const [state, setState] = useState<"loading" | "content" | "error">("loading")

  useEffect(() => {
    fetch("/api/dashboard/usage", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("err")))
      .then((d: Usage) => { setData(d); setState("content") })
      .catch(() => setState("error"))
  }, [])

  // Format the "ends at" date for the header description.
  const description =
    data?.period.endsAt
      ? `${t("usage.untilLabel")} ${formatDate(data.period.endsAt, lang)}`
      : t("dash.usage.description")

  return (
    <WidgetContainer
      title={t("dash.usage.title")}
      description={description}
      icon={Activity}
      state={state}
      error={{
        title: t("usage.errTitle"),
        description: t("usage.errDesc"),
        retry: () => { setState("loading"); fetch("/api/dashboard/usage", { cache: "no-store" }).then(r => r.json()).then((d: Usage) => { setData(d); setState("content") }).catch(() => setState("error")) },
        retryLabel: t("widget.retry"),
      }}
      action={
        <Link
          href="/dashboard/pricing"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          {t("usage.viewPlans")}
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      }
      minBodyHeight={0}
    >
      {data && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <UsageBar
            label={t("usage.messages")}
            used={data.messages.used}
            limit={data.messages.limit}
            unitKey="usage.unitMsg"
          />
          <UsageBar
            label={t("usage.numbers")}
            used={data.numbers.used}
            limit={data.numbers.limit}
            unitKey="usage.unitNum"
          />
          <UsageBar
            label={t("usage.apiToday")}
            used={data.apiToday.used}
            limit={data.apiToday.limit}
            unitKey="usage.unitApi"
          />
        </div>
      )}
    </WidgetContainer>
  )
}

// ────────────────────────────────────────────────────────────
// Internal — a single labeled stat with progress bar
// ────────────────────────────────────────────────────────────

function UsageBar({
  label,
  used,
  limit,
  unitKey,
}: {
  label: string
  used: number
  limit: number | null
  unitKey: string
}) {
  const { t } = useI18n()
  const isUnlimited = limit === null

  // Progress percentage. Clamp to [0, 100].
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit!)) * 100))

  // Tint by threshold (cool / warm / hot).
  const tint =
    isUnlimited ? "bg-primary/60" :
    pct >= 90 ? "bg-red-500" :
    pct >= 70 ? "bg-amber-500" :
    "bg-primary"

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <span className="text-xs text-muted-foreground font-medium truncate">{label}</span>
        {!isUnlimited && (
          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
            {pct}%
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-xl font-bold text-foreground tabular-nums truncate">
          {used.toLocaleString()}
        </span>
        {!isUnlimited && (
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            / {limit!.toLocaleString()}
          </span>
        )}
        {isUnlimited && (
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 shrink-0">
            <Gauge className="w-3 h-3" /> {t("usage.unlimited")}
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/80 truncate">
        {t(unitKey)}
      </p>

      {!isUnlimited && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full ${tint} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Helper — locale-aware short date for the header description
// ────────────────────────────────────────────────────────────

function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      month: "short", day: "numeric",
    })
  } catch {
    return ""
  }
}
