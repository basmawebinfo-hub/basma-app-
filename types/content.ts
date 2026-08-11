/**
 * The content contract.
 *
 * Everything the UI knows about courses and levels is described here. Today
 * `lib/content/` fulfils it by reading markdown off disk; tomorrow it can be a
 * CMS, an API, or a database, and no page or component changes.
 *
 * That only holds if nothing outside `lib/content/` touches the filesystem or
 * parses frontmatter. If a component imports `fs`, this contract is broken.
 */

export type LevelStatus = "published" | "draft" | "coming-soon"

/** A level as listed on a course page — no body, cheap to load in bulk. */
export interface LevelSummary {
  slug: string
  order: number
  title: string
  titleAr: string
  subtitle: string
  status: LevelStatus
  /** Present only once a video exists. Most levels have none yet. */
  vimeo?: string
  duration?: string
}

/** A level with its rendered body. */
export interface Level extends LevelSummary {
  courseSlug: string
  /** Raw markdown. The renderer, not the loader, decides how it looks. */
  body: string
}

export interface CourseSummary {
  slug: string
  title: string
  titleAr: string
  subtitle: string
  description: string
  order: number
  /** Levels that exist as files, published or not. */
  levelCount: number
  /** How many are actually readable today. Drives the honest "4 of 14" copy. */
  publishedCount: number
  /** Total levels the course will have when finished. */
  plannedLevels: number
}

export interface Course extends CourseSummary {
  levels: LevelSummary[]
}

/** Shape of `course.json`. Kept separate so the file format can change freely. */
export interface CourseFile {
  title: string
  titleAr: string
  subtitle: string
  description: string
  order: number
  plannedLevels: number
}
