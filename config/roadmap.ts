/**
 * The roadmap's real state, in one place.
 *
 * The hero states how far along the roadmap is and the roadmap section lists
 * the levels; both must agree, always. They previously couldn't — the counts
 * lived as module-local constants inside `components/academy-teaser.tsx`, so
 * any second surface would have had to retype them and could silently drift.
 *
 * RULE: only levels that are actually written appear in `WRITTEN_LEVELS`. The
 * rest are counted, never named. Naming a level that doesn't exist is the same
 * failure as the WhatsApp copy this site replaced.
 * Source of truth for what's written: `D:\Basma agancy\BasmaProgram`.
 */

export interface RoadmapLevel {
  /** Level number as published, 1-based. */
  n: number
  /** i18n key — copy lives in lib/i18n.tsx, not here. */
  key: string
}

export const WRITTEN_LEVELS: RoadmapLevel[] = [
  { n: 1, key: "academy.l1" },
  { n: 2, key: "academy.l2" },
  { n: 3, key: "academy.l3" },
  { n: 4, key: "academy.l4" },
]

/** Levels in the full roadmap, written or not. */
export const TOTAL_LEVELS = 14

/** Derived — never typed as a literal into a string. */
export const WRITTEN_COUNT = WRITTEN_LEVELS.length
export const REMAINING_COUNT = TOTAL_LEVELS - WRITTEN_COUNT
