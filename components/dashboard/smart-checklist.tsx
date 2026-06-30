"use client"

/**
 * Smart Checklist — the first widget a new user sees on /dashboard.
 *
 * Behavior:
 *   - 5 steps. As each completes, it visually checks off.
 *   - Server-derived completion for the 2 DB-backed steps
 *     (profile fill + first WhatsApp connection).
 *   - Client-tracked completion (localStorage) for the 3 visit-style steps
 *     (intro video, lab demo, first course). When Academy/Lab ship the
 *     real tables, we migrate the localStorage flags into the DB.
 *   - Auto-hides once all 5 steps are complete (and never comes back).
 *   - User can dismiss "for now" — comes back next login.
 *
 * Source: DASHBOARD_INFORMATION_ARCHITECTURE.md §2.1 (First-time Login Flow)
 */

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, Circle, X, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useCurrentUser } from "@/hooks/useCurrentUser"

type StepId =
  | "complete-profile"
  | "watch-intro"
  | "connect-whatsapp"
  | "try-ai-demo"
  | "open-course"

type Step = {
  id: StepId
  titleKey: string
  href: string
  /** If true, completion is decided server-side via /api/dashboard/checklist. */
  serverTracked: boolean
}

const STEPS: ReadonlyArray<Step> = [
  { id: "complete-profile", titleKey: "ck.s1", href: "/dashboard/settings", serverTracked: true },
  { id: "watch-intro",      titleKey: "ck.s2", href: "/dashboard/academy", serverTracked: false },
  { id: "connect-whatsapp", titleKey: "ck.s3", href: "/dashboard/connect",  serverTracked: true },
  { id: "try-ai-demo",      titleKey: "ck.s4", href: "/dashboard/lab",      serverTracked: false },
  { id: "open-course",      titleKey: "ck.s5", href: "/dashboard/academy",  serverTracked: false },
]

const LS_LOCAL_KEY = "basma.checklist.local"
const LS_DISMISS_KEY = "basma.checklist.dismissedAt"

type LocalState = Partial<Record<StepId, true>>

function readLocal(): LocalState {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(LS_LOCAL_KEY) || "{}") as LocalState
  } catch {
    return {}
  }
}

function writeLocal(state: LocalState) {
  try {
    localStorage.setItem(LS_LOCAL_KEY, JSON.stringify(state))
  } catch {
    /* quota errors are ignored — non-critical state */
  }
}

export function SmartChecklist() {
  const { t } = useI18n()
  const user = useCurrentUser()
  const [serverDone, setServerDone] = useState<Record<string, boolean>>({})
  const [localDone, setLocalDone] = useState<LocalState>({})
  const [dismissed, setDismissed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Boot: hydrate from localStorage + fetch server state in parallel.
  useEffect(() => {
    setLocalDone(readLocal())

    // Check whether the user dismissed it today (resets on next calendar day).
    try {
      const at = localStorage.getItem(LS_DISMISS_KEY)
      if (at) {
        const dismissedAt = new Date(at)
        const today = new Date()
        dismissedAt.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        if (dismissedAt.getTime() === today.getTime()) setDismissed(true)
      }
    } catch {
      /* ignore */
    }

    fetch("/api/dashboard/checklist", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { serverSteps: {} }))
      .then((d) => setServerDone(d.serverSteps ?? {}))
      .catch(() => setServerDone({}))
      .finally(() => setLoaded(true))
  }, [])

  // Mark a step as completed in local state (only used for non-server steps).
  // We expose this for Phase 2/3 — Lab/Academy will call it when the user
  // visits the page for the first time. For now, items stay unchecked until
  // we wire it up (intentional — Honest UX over fake progress).

  const completed: Record<StepId, boolean> = useMemo(() => {
    const map = {} as Record<StepId, boolean>
    for (const step of STEPS) {
      if (step.serverTracked) {
        map[step.id] = Boolean(serverDone[step.id])
      } else {
        map[step.id] = Boolean(localDone[step.id])
      }
    }
    return map
  }, [serverDone, localDone])

  const totalDone = STEPS.reduce(
    (acc, s) => acc + (completed[s.id] ? 1 : 0),
    0,
  )
  const allDone = totalDone === STEPS.length

  // Hide once everything is done (permanent — never comes back).
  if (allDone) return null
  // Hide if dismissed today.
  if (dismissed) return null
  // While loading we render a low-profile skeleton instead of a blank gap.
  if (!loaded) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse h-[210px]" />
    )
  }

  const onDismiss = () => {
    try {
      localStorage.setItem(LS_DISMISS_KEY, new Date().toISOString())
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  const userName =
    user?.profile.full_name?.trim().split(" ")[0] ?? null
  const greeting = userName
    ? t("ck.greetingNamed").replace("{name}", userName)
    : t("ck.greeting")

  const progressPct = Math.round((totalDone / STEPS.length) * 100)

  return (
    <section
      aria-label={t("ck.title")}
      className="relative bg-card border border-border rounded-2xl p-6 overflow-hidden"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("ck.dismiss")}
        className="absolute top-4 end-4 w-7 h-7 rounded-full text-muted-foreground/60 hover:bg-secondary hover:text-foreground flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 mb-5">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            {greeting}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("ck.subtitle")}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-5">
        {STEPS.map((step) => {
          const done = completed[step.id]
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={
                  "flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg text-sm transition-colors " +
                  (done
                    ? "text-muted-foreground line-through decoration-muted-foreground/40 hover:bg-secondary/40"
                    : "text-foreground hover:bg-secondary/60")
                }
              >
                {done ? (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                )}
                <span className="flex-1">{t(step.titleKey)}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
          {totalDone} / {STEPS.length}
        </span>
      </div>
    </section>
  )
}
