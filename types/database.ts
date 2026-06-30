/**
 * Database types — the strict, exhaustive shape of every row in every table.
 *
 * STATUS: Hand-typed for the tables we touch in Phase 1.
 *
 * Why not auto-generated?
 *   - The repo doesn't have a Supabase CLI workflow wired up yet.
 *   - Hand-typing the Phase 1 subset is faster than setting up CI to run
 *     `supabase gen types typescript` on every schema change.
 *   - Once Phase 2 starts (Academy tables), we wire up the generator and
 *     this file becomes the generated artifact (see TODO at the bottom).
 *
 * Source: DB_SCHEMA.md (Source of truth).
 *
 * Adding a table:
 *   1. Define a `{TableName}Row` type matching the DB exactly.
 *   2. Add it to the `Database["public"]["Tables"]` map.
 *   3. Use `Tables<"name">` everywhere instead of the raw type, so the
 *      switch to generated types later is a no-op.
 */

import type { UUID, ISODateString, Nullable } from "./common"
import type {
  Plan,
  Subscription,
  PlanRequest,
  CreditTransaction,
} from "./billing"
import type { Profile } from "./auth"

// ----- Tables ---------------------------------------------------------------

export type InstanceStatus =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "QR_READY"

export type InstanceRow = {
  id: UUID
  user_id: UUID
  instance_name: string
  display_name: string
  phone: Nullable<string>
  status: InstanceStatus
  created_at: Nullable<ISODateString>
  updated_at: Nullable<ISODateString>
}

export type NotificationLevel = "info" | "warning" | "critical"

export type NotificationRow = {
  id: UUID
  user_id: UUID
  title: string
  body: Nullable<string>
  level: NotificationLevel
  is_read: boolean
  created_by: Nullable<UUID>
  created_at: Nullable<ISODateString>
}

// ----- Database surface (Supabase-generator-compatible shape) ---------------
//
// This intentionally mirrors the shape the Supabase types generator produces,
// so when we eventually run `supabase gen types`, the swap is mechanical.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: UUID }
        Update: Partial<Profile>
      }
      plans: {
        Row: Plan
        Insert: Omit<Plan, "id" | "created_at"> & Partial<Pick<Plan, "id">>
        Update: Partial<Plan>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Subscription, "id">>
        Update: Partial<Subscription>
      }
      plan_requests: {
        Row: PlanRequest
        Insert: Omit<PlanRequest, "id" | "created_at"> &
          Partial<Pick<PlanRequest, "id">>
        Update: Partial<PlanRequest>
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: Omit<CreditTransaction, "id" | "created_at"> &
          Partial<Pick<CreditTransaction, "id">>
        Update: Partial<CreditTransaction>
      }
      instances: {
        Row: InstanceRow
        Insert: Omit<InstanceRow, "id" | "created_at" | "updated_at"> &
          Partial<Pick<InstanceRow, "id">>
        Update: Partial<InstanceRow>
      }
      notifications: {
        Row: NotificationRow
        Insert: Omit<NotificationRow, "id" | "created_at"> &
          Partial<Pick<NotificationRow, "id">>
        Update: Partial<NotificationRow>
      }
    }
  }
}

/**
 * Helper alias so callers can write:
 *   const plan: Tables<"plans"> = ...
 * instead of:
 *   const plan: Database["public"]["Tables"]["plans"]["Row"] = ...
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

// TODO(Phase 2): Replace this file with `supabase gen types typescript` output.
// See: https://supabase.com/docs/guides/api/rest/generating-types
