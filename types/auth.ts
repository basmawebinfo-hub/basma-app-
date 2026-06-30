/**
 * Auth-related types — the shape of the current user from Supabase + our
 * `profiles` row, joined into one object that the rest of the app consumes.
 *
 * The "current user" everywhere in the app is `CurrentUser`. It bundles the
 * Supabase auth identity with the BASMA profile so callers never have to
 * worry about which side a given field came from.
 */

import type { Role, AccountStatus, UUID, ISODateString, Nullable } from "./common"
import type { TierSlug } from "./common"

/**
 * Mirrors the `profiles` row in the DB.
 * Generated from DB_SCHEMA.md §1 (Users & Auth domain).
 */
export type Profile = {
  id: UUID
  email: Nullable<string>
  full_name: Nullable<string>
  company: Nullable<string>
  avatar_url: Nullable<string>
  role: "user" | "admin" | "super_admin"
  status: AccountStatus
  /** Free-text plan name — NOT a FK. Source of truth = subscriptions.plan_id. */
  plan: string
  plan_expires_at: Nullable<ISODateString>
  balance: number
  max_instances: number
  max_messages: number
  custom_max_instances: Nullable<number>
  notes: Nullable<string>
  whatsapp: Nullable<string>
  telegram_chat_id: Nullable<string>
  telegram_link_code: Nullable<string>
  telegram_link_expires_at: Nullable<ISODateString>
  telegram_linked_at: Nullable<ISODateString>
  created_at: Nullable<ISODateString>
  updated_at: Nullable<ISODateString>
}

/**
 * The Supabase Auth identity stripped down to what we actually use.
 * Avoids importing `@supabase/supabase-js` types in client code.
 */
export type AuthUser = {
  id: UUID
  email: string | undefined
  emailConfirmedAt: Nullable<string>
}

/**
 * The unified user object consumed by every Server Component, hook, and guard.
 * Built once in `lib/auth/session.ts` and passed downstream.
 */
export type CurrentUser = {
  /** Supabase auth identity */
  auth: AuthUser
  /** The matching `profiles` row */
  profile: Profile
  /** The canonical role (post-normalization) — see config/permissions.ts */
  role: Role
  /** The current subscription tier slug — derived from subscriptions+plans */
  tier: TierSlug
}
