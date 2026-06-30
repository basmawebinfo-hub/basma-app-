/**
 * Common type primitives — re-exported from config so callers have one place
 * to import "the basics" from.
 *
 * Anything that is genuinely cross-cutting (Tier, Role, Permission) lives here.
 * Domain-specific types (Subscription, Plan, etc.) live in their own files.
 */

export type { TierSlug, Tier } from "@/config/tiers"
export type { Role, Permission } from "@/config/permissions"

/**
 * Account-level status — mirrors `profiles.status` in the DB.
 *
 * Note: `subscriptions.status` has a different (overlapping but distinct) set
 * of values — see types/billing.ts. Don't confuse the two.
 */
export type AccountStatus = "active" | "suspended" | "pending"

/**
 * UI-only — the visual theme. Persisted in localStorage, never in the DB.
 */
export type Theme = "light" | "dark" | "system"

/**
 * UI-only — the locale. Mirrors `APP.supportedLocales`.
 */
export type Locale = "ar" | "en"

/**
 * A bilingual label — used across config and content. The Dashboard's
 * `useLocale()` hook picks the right side based on the user's setting.
 */
export type Bilingual = {
  ar: string
  en: string
}

/**
 * UUID-shaped string. We don't validate it at the type level (TS can't),
 * but using this alias documents intent and helps grep.
 */
export type UUID = string

/**
 * ISO-8601 timestamp string as Supabase returns it.
 * e.g. "2026-06-30T17:42:28.224Z"
 */
export type ISODateString = string

/**
 * A nullable form of T. Used where the DB column is explicitly nullable
 * so the caller is forced to handle both cases.
 */
export type Nullable<T> = T | null

/**
 * Drop the `id` and `created_at`/`updated_at` fields from a DB row to get the
 * shape of an "insert" payload. Useful for forms.
 */
export type Insertable<T> = Omit<
  T,
  "id" | "created_at" | "updated_at"
>

/**
 * The reverse of Insertable — every field optional, used for PATCH/update.
 */
export type Updatable<T> = Partial<Omit<T, "id" | "created_at">>
