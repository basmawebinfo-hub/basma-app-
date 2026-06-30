import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Returns the current user's usage snapshot.
 *
 * Fields:
 *   messages: { used, limit }       // limit=null means unlimited
 *   numbers:  { used, limit }       // CONNECTED instances vs plan cap
 *   apiToday: { used, limit }       // api_usage_log rows today vs plan rate-limit/min * 60 * 24
 *   period:   { endsAt }            // current_period_end for the badge
 *
 * Source spec: SUCCESS_METRICS.md §4 (WhatsApp Service Metrics) + plans table.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Resolve subscription + plan in one round trip.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status, current_period_end, messages_used")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let messageLimit: number | null = null
  let numberLimit: number | null = null

  if (sub?.plan_id) {
    const { data: plan } = await supabase
      .from("plans")
      .select("max_messages_mo, max_instances")
      .eq("id", sub.plan_id)
      .single()
    // Legacy convention in this DB: 0 means unlimited.
    messageLimit = plan?.max_messages_mo && plan.max_messages_mo > 0
      ? plan.max_messages_mo : null
    numberLimit = plan?.max_instances && plan.max_instances > 0
      ? plan.max_instances : null
  }

  // Count CONNECTED instances (real, not just rows in the table).
  const { count: numbersUsed } = await supabase
    .from("instances")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "CONNECTED")

  // API calls today.
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: apiToday } = await supabase
    .from("api_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString())

  return NextResponse.json({
    messages: {
      used: sub?.messages_used ?? 0,
      limit: messageLimit,
    },
    numbers: {
      used: numbersUsed ?? 0,
      limit: numberLimit,
    },
    apiToday: {
      used: apiToday ?? 0,
      limit: null, // No daily API cap in the current plan schema — hidden in UI.
    },
    period: {
      endsAt: sub?.current_period_end ?? null,
    },
  })
}
