/**
 * Billing types — mirror the DB plus what `features/billing` exposes
 * to the rest of the app.
 *
 * Source spec:
 *   - DB_SCHEMA.md §2 (Plans & Billing)
 *   - PRICING.md (FROZEN v1.0)
 */

import type { UUID, ISODateString, Nullable, TierSlug } from "./common"

/**
 * Mirrors the `plans` row.
 *
 * IMPORTANT: The current production schema does NOT yet have `tier_slug`,
 * `has_academy_access`, `has_lab_download`, etc. Those columns are part of
 * the upcoming Phase 1 migration (see DB_SCHEMA.md §"Migrations المخطّطة").
 *
 * The fields below are marked optional so we can land this type today and
 * fill in the new columns after the migration runs — no breaking changes
 * for callers that only read the existing fields.
 */
export type Plan = {
  id: UUID
  name: string
  price_monthly: number
  max_instances: number
  max_messages_mo: number // 0 means unlimited (legacy convention in this DB)
  max_campaigns: number
  has_ai_bot: boolean
  has_team_mgmt: boolean
  is_active: boolean
  currency: string
  created_at: Nullable<ISODateString>

  // --- Phase 1 migration additions (optional until the migration lands) ---
  tier_slug?: TierSlug
  price_yearly?: Nullable<number>
  has_academy_access?: boolean
  has_lab_download?: boolean
  has_personal_sandbox?: boolean
  max_webhooks?: number
  max_auto_replies?: number
  api_rate_limit_per_min?: number
}

/**
 * Mirrors the `subscriptions` row. `user_id` is UNIQUE — one sub per user.
 */
export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "past_due"
  | "trialing"

export type Subscription = {
  id: UUID
  user_id: UUID
  plan_id: UUID
  status: SubscriptionStatus
  stripe_sub_id: Nullable<string>
  current_period_start: Nullable<ISODateString>
  current_period_end: Nullable<ISODateString>
  messages_used: number
  created_at: Nullable<ISODateString>
  updated_at: Nullable<ISODateString>
}

/**
 * Mirrors `plan_requests` — manual upgrade flow (Phase 1).
 * Will be retired once Paymob/Stripe auto-billing is live (Phase 3).
 */
export type PlanRequestStatus = "pending" | "approved" | "rejected"

export type PlanRequest = {
  id: UUID
  user_id: UUID
  plan_id: UUID
  status: PlanRequestStatus
  created_at: Nullable<ISODateString>
}

/**
 * Mirrors `credit_transactions` — the ledger of every credit movement.
 * Useful for displaying billing history before invoices exist.
 */
export type CreditTransactionType =
  | "topup"
  | "debit"
  | "refund"
  | "adjustment"

export type CreditTransaction = {
  id: UUID
  user_id: UUID
  amount: number
  type: CreditTransactionType
  reason: Nullable<string>
  balance_after: Nullable<number>
  created_by: Nullable<UUID>
  created_at: Nullable<ISODateString>
}

/**
 * The denormalized view that the Dashboard widget uses.
 * Built by `features/billing/server/get-current-plan.ts`.
 */
export type CurrentPlanSummary = {
  tier: TierSlug
  plan: Plan
  subscription: Subscription | null
  /** Days remaining in the current period — null if no end date. */
  daysRemaining: Nullable<number>
  /** Messages used this period / max — both null mean "unlimited". */
  usage: {
    messagesUsed: number
    messagesLimit: Nullable<number>
  }
}
