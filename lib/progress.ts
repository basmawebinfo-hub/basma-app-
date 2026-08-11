"use client"

/**
 * Local progress tracking.
 *
 * There is no backend, so "progress" is whatever this browser remembers. When
 * the dashboard arrives, these four functions become server calls and nothing
 * that imports them changes — same discipline as `lib/content/`.
 *
 * Every path degrades silently: private mode, disabled storage, and quota
 * errors all behave as "no progress recorded" rather than throwing. Losing a
 * checkmark is acceptable; breaking the page a student is reading is not.
 *
 * Deliberately absent: any "sign in to save your progress" affordance. There is
 * no account system, and offering one that doesn't exist is worse than nothing.
 */

const KEY = "basma_progress"

type Store = Record<string, string[]>

function read(): Store {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" ? (parsed as Store) : {}
  } catch {
    return {}
  }
}

function write(store: Store): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // Quota or disabled storage — the UI already reflects the change in memory.
  }
}

export function getCompleted(course: string): string[] {
  return read()[course] ?? []
}

export function isCompleted(course: string, level: string): boolean {
  return getCompleted(course).includes(level)
}

export function setCompleted(course: string, level: string, done: boolean): string[] {
  const store = read()
  const current = new Set(store[course] ?? [])
  if (done) current.add(level)
  else current.delete(level)
  store[course] = [...current]
  write(store)
  return store[course]
}

/** Fired on change so several components can stay in sync within a tab. */
export const PROGRESS_EVENT = "basma:progress"

export function notifyProgressChange(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PROGRESS_EVENT))
}
