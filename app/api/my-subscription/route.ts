import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const TRIAL_DAYS = 7

// GET /api/my-subscription — current user's plan, days left, balance, renewal status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, balance, status, created_at, role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ plan: null })

  // Active subscription (paid plans live here)
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let planName = profile.plan ?? null
  let maxInstances: number | null = null
  // Trial flag now comes directly from the plans table (post-migration
  // 2026-07-01 added the `is_trial` boolean). No more string-matching the
  // plan name in Arabic — translations or renames will not break this.
  let planIsTrial = false
  if (sub?.plan_id) {
    const { data: plan } = await supabase
      .from("plans")
      .select("name, max_instances, is_trial")
      .eq("id", sub.plan_id)
      .maybeSingle()
    if (plan) {
      planName = plan.name
      maxInstances = plan.max_instances
      planIsTrial = Boolean(plan.is_trial)
    }
  }

  const pastDue = sub?.status === "past_due"

  // Days left: prefer subscription period end; fall back to 7-day trial from signup
  let daysLeft: number | null = null
  let periodEnd: string | null = null
  if (sub?.current_period_end) {
    periodEnd = sub.current_period_end
    daysLeft = Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  } else if (profile.status === "pending") {
    // Account not approved yet — freeze the trial at full days; clock starts on approval
    daysLeft = TRIAL_DAYS
    periodEnd = null
  } else if (profile.created_at) {
    const end = new Date(profile.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    periodEnd = new Date(end).toISOString()
    daysLeft = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  // count current numbers
  const { count: numbersUsed } = await supabase.from("instances").select("id", { count: "exact", head: true }).eq("user_id", user.id)

  // is_trial is true when:
  //   - the user is on a plan whose is_trial flag is set, OR
  //   - the user has no subscription row at all (fresh signup, still on the
  //     7-day implicit trial counted from profile.created_at).
  const isTrial = planIsTrial || !sub?.plan_id

  return NextResponse.json({
    plan: planName,
    days_left: daysLeft,
    trial_end: periodEnd,
    is_trial: isTrial,
    past_due: pastDue,
    balance: profile.balance ?? 0,
    status: profile.status ?? null,
    role: profile.role ?? "user",
    max_instances: maxInstances,
    numbers_used: numbersUsed ?? 0,
  })
}
