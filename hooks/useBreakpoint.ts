"use client"

/**
 * Returns the current responsive breakpoint based on window.innerWidth.
 *
 * Aligned with BREAKPOINTS in config/constants.ts and the Tailwind defaults.
 * Returns "sm" on first render (SSR-safe) and updates on mount + resize.
 *
 * Note: the repo already has `hooks/use-mobile.ts` for the simple
 * mobile/desktop case. Prefer that for binary mobile/non-mobile UI
 * branching. Use this hook when you need to know the SPECIFIC bucket
 * (e.g. "lg" vs "xl" for column counts).
 */

import { useEffect, useState } from "react"
import { BREAKPOINTS } from "@/config/constants"

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

function detect(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl"
  if (width >= BREAKPOINTS.xl) return "xl"
  if (width >= BREAKPOINTS.lg) return "lg"
  if (width >= BREAKPOINTS.md) return "md"
  return "sm"
}

export function useBreakpoint(): Breakpoint {
  // Default to "sm" on SSR so the first paint doesn't flash desktop layout.
  const [bp, setBp] = useState<Breakpoint>("sm")

  useEffect(() => {
    function handler() {
      setBp(detect(window.innerWidth))
    }
    handler() // sync once on mount
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return bp
}
