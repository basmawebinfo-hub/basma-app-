"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Wraps the app so framer-motion honors the user's
 * prefers-reduced-motion OS setting globally (transform/layout
 * animations are disabled, opacity-only fades remain).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
