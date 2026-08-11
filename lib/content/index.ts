import "server-only"

import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

import type {
  Course,
  CourseFile,
  CourseSummary,
  Level,
  LevelStatus,
  LevelSummary,
} from "@/types/content"

/**
 * The ONLY module in this repo that touches the content filesystem.
 *
 * Swapping to a CMS or database means rewriting the four exported functions
 * below and nothing else — see `types/content.ts` for why that matters.
 *
 * Adding a level is dropping a `.md` file into
 * `content/courses/<course>/levels/`. There is deliberately no registry,
 * index, or manifest to keep in sync: anything the owner has to remember to
 * update is something that will eventually be forgotten.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content", "courses")

const VALID_STATUS: LevelStatus[] = ["published", "draft", "coming-soon"]

function parseStatus(raw: unknown): LevelStatus {
  return VALID_STATUS.includes(raw as LevelStatus) ? (raw as LevelStatus) : "draft"
}

/** `01-ai-problem-solver.md` → `ai-problem-solver` (order comes from frontmatter). */
function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "")
}

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir)
  } catch {
    // A missing content directory is an empty catalogue, not a crash. The site
    // must still build if content hasn't been added yet.
    return []
  }
}

async function loadLevelSummaries(courseSlug: string): Promise<LevelSummary[]> {
  const dir = path.join(CONTENT_ROOT, courseSlug, "levels")
  const files = (await readDirSafe(dir)).filter((f) => f.endsWith(".md"))

  const levels = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), "utf8")
      const { data } = matter(raw)
      const slug = slugFromFilename(file)
      return {
        slug,
        order: Number(data.order) || 0,
        title: String(data.title ?? slug),
        titleAr: String(data.titleAr ?? data.title ?? slug),
        subtitle: String(data.subtitle ?? ""),
        status: parseStatus(data.status),
        vimeo: data.vimeo ? String(data.vimeo) : undefined,
        duration: data.duration ? String(data.duration) : undefined,
      } satisfies LevelSummary
    }),
  )

  return levels.sort((a, b) => a.order - b.order)
}

async function loadCourseFile(courseSlug: string): Promise<CourseFile | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_ROOT, courseSlug, "course.json"), "utf8")
    return JSON.parse(raw) as CourseFile
  } catch {
    return null
  }
}

function summarise(slug: string, meta: CourseFile, levels: LevelSummary[]): CourseSummary {
  return {
    slug,
    title: meta.title,
    titleAr: meta.titleAr,
    subtitle: meta.subtitle,
    description: meta.description,
    order: meta.order ?? 0,
    levelCount: levels.length,
    publishedCount: levels.filter((l) => l.status === "published").length,
    plannedLevels: meta.plannedLevels ?? levels.length,
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getCourses(): Promise<CourseSummary[]> {
  const slugs = await readDirSafe(CONTENT_ROOT)

  const courses = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await loadCourseFile(slug)
      if (!meta) return null
      return summarise(slug, meta, await loadLevelSummaries(slug))
    }),
  )

  return courses
    .filter((c): c is CourseSummary => c !== null)
    .sort((a, b) => a.order - b.order)
}

export async function getCourse(slug: string): Promise<Course | null> {
  const meta = await loadCourseFile(slug)
  if (!meta) return null

  const levels = await loadLevelSummaries(slug)
  return { ...summarise(slug, meta, levels), levels }
}

export async function getLevel(courseSlug: string, levelSlug: string): Promise<Level | null> {
  const dir = path.join(CONTENT_ROOT, courseSlug, "levels")
  const files = (await readDirSafe(dir)).filter((f) => f.endsWith(".md"))
  const file = files.find((f) => slugFromFilename(f) === levelSlug)
  if (!file) return null

  const raw = await fs.readFile(path.join(dir, file), "utf8")
  const { data, content } = matter(raw)

  return {
    courseSlug,
    slug: levelSlug,
    order: Number(data.order) || 0,
    title: String(data.title ?? levelSlug),
    titleAr: String(data.titleAr ?? data.title ?? levelSlug),
    subtitle: String(data.subtitle ?? ""),
    status: parseStatus(data.status),
    vimeo: data.vimeo ? String(data.vimeo) : undefined,
    duration: data.duration ? String(data.duration) : undefined,
    body: content.trim(),
  }
}

/**
 * Every (course, level) pair, for `generateStaticParams` and the sitemap.
 * Generated from content so neither has to be maintained by hand.
 */
export async function getAllLevelPaths(): Promise<{ course: string; level: string }[]> {
  const courses = await getCourses()
  const paths = await Promise.all(
    courses.map(async (c) =>
      (await loadLevelSummaries(c.slug)).map((l) => ({ course: c.slug, level: l.slug })),
    ),
  )
  return paths.flat()
}
