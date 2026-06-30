"use client"

/**
 * WidgetPlaceholder — a courteous "Coming in Phase N" body that uses the
 * same WidgetContainer chrome as a real widget.
 *
 * Why have it at all?
 *   - The Dashboard Home grid is locked NOW (the user explicitly asked for a
 *     final, non-shifting layout). Real widgets will land patch-by-patch,
 *     but each one drops into a pre-shaped slot.
 *   - Using the same WidgetContainer chrome means swapping a placeholder
 *     for a real widget changes ZERO other CSS in the grid.
 *
 * Each placeholder shares the locked icon + phase badge so the user knows
 * exactly when to expect it.
 */

import { Lock, type LucideIcon } from "lucide-react"
import { WidgetContainer } from "./widget-container"

type Props = {
  title: string
  description?: string
  icon?: LucideIcon
  /** Roadmap phase that introduces this widget — shown in the badge */
  phase?: 2 | 3 | 4
  /** Short pitch shown to the user explaining why this is worth waiting for */
  pitch?: string
  /** Required tier name to show in the lock copy (e.g. "Pro") */
  requiredTier?: string
  /** Whether to grey out the widget (for tier-gated slots) */
  greyed?: boolean
  /** Local placeholder labels (i18n strings passed in by the parent) */
  labels: {
    /** "قريباً في المرحلة 2" / "Coming in Phase 2" — already localized */
    phaseLabel: string
    /** "متاحة في باقة Pro" / "Available on Pro" — already localized */
    tierLabel: string
  }
}

export function WidgetPlaceholder({
  title,
  description,
  icon,
  phase,
  pitch,
  requiredTier,
  greyed = false,
  labels,
}: Props) {
  return (
    <WidgetContainer
      title={title}
      description={description}
      icon={icon}
      state="empty"
      className={greyed ? "opacity-70" : undefined}
      empty={{
        icon: Lock,
        title: pitch ?? title,
        description: requiredTier ? labels.tierLabel : labels.phaseLabel,
      }}
    />
  )
}
