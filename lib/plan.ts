import { createClient as createServiceClient } from "@supabase/supabase-js"

export interface UserPlan {
  plan_id: string | null
  plan_name: string
  max_instances: number
  max_messages_mo: number   // 0 = unlimited
  status: string            // subscription status
  current_period_end: string | null
  messages_used: number
}

function svc() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/** Resolve a user's effective plan + limits from subscriptions + plans. */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  const db = svc()
  const { data: sub } = await db
    .from("subscriptions")
    .select("plan_id, status, current_period_end, messages_used")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Default (no subscription) = trial-ish free limits
  if (!sub?.plan_id) {
    return { plan_id: null, plan_name: "—", max_instances: 1, max_messages_mo: 500, status: "none", current_period_end: null, messages_used: 0 }
  }

  const { data: plan } = await db
    .from("plans")
    .select("name, max_instances, max_messages_mo")
    .eq("id", sub.plan_id)
    .single()

  return {
    plan_id: sub.plan_id,
    plan_name: plan?.name ?? "—",
    max_instances: plan?.max_instances ?? 1,
    max_messages_mo: plan?.max_messages_mo ?? 0,
    status: sub.status ?? "active",
    current_period_end: sub.current_period_end ?? null,
    messages_used: sub.messages_used ?? 0,
  }
}

/** Set/change a user's plan (upserts their subscription). */
export async function setUserPlan(userId: string, planId: string, periodEnd?: string) {
  const db = svc()
  const { data: existing } = await db.from("subscriptions").select("id").eq("user_id", userId).limit(1).single()
  if (existing?.id) {
    await db.from("subscriptions").update({
      plan_id: planId, status: "active",
      current_period_end: periodEnd ?? null, updated_at: new Date().toISOString(),
    }).eq("id", existing.id)
  } else {
    await db.from("subscriptions").insert({
      user_id: userId, plan_id: planId, status: "active", current_period_end: periodEnd ?? null,
    })
  }
}
