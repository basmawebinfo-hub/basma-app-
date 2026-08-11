"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PROGRESS_EVENT,
  getCompleted,
  isCompleted,
  notifyProgressChange,
  setCompleted,
} from "@/lib/progress"
import { useI18n } from "@/lib/i18n"

/**
 * Progress is read after mount, never during render: localStorage doesn't exist
 * on the server, and reading it during the first client render would produce a
 * hydration mismatch. Both components therefore start in the "not completed"
 * state and correct themselves immediately.
 */
function useProgress(course: string) {
  const [completed, setList] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(() => setList(getCompleted(course)), [course])

  useEffect(() => {
    refresh()
    setReady(true)
    window.addEventListener(PROGRESS_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  return { completed, ready }
}

export function CourseProgress({ course, total }: { course: string; total: number }) {
  const { t } = useI18n()
  const { completed, ready } = useProgress(course)

  const done = completed.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="text-muted-foreground">{t("academy.progress")}</span>
        {/* dir="ltr": in an RTL document the bidi algorithm reorders "0 / 4"
            into "4 / 0", which reads as the opposite of what it means. */}
        <span dir="ltr" className="text-foreground font-medium tabular-nums">
          {ready ? `${done} / ${total}` : `— / ${total}`}
        </span>
      </div>
      <div
        className="h-2 bg-elevated overflow-hidden"
        role="progressbar"
        aria-valuenow={ready ? pct : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("academy.progress")}
      >
        <div
          className="h-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${ready ? pct : 0}%` }}
        />
      </div>
    </div>
  )
}

export function CompleteToggle({ course, level }: { course: string; level: string }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(isCompleted(course, level))
  }, [course, level])

  function toggle() {
    const next = !done
    setDone(next)
    setCompleted(course, level, next)
    notifyProgressChange()
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      variant={done ? "secondary" : "outline"}
      size="lg"
     
      aria-pressed={done}
    >
      {done ? <Check className="w-4 h-4" aria-hidden="true" /> : <Circle className="w-4 h-4" aria-hidden="true" />}
      {done ? t("academy.completed") : t("academy.markComplete")}
    </Button>
  )
}

/** Small tick shown next to a level in the course list. */
export function LevelTick({ course, level }: { course: string; level: string }) {
  const { completed, ready } = useProgress(course)
  if (!ready || !completed.includes(level)) return null
  return <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
}
