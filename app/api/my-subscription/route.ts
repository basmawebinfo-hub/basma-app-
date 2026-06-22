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
    .select("plan, balance, status, created_at")
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
  if (sub?.plan_id) {
    const { data: plan } = await supabase.from("plans").select("name, price_monthly, max_instances").eq("id", sub.plan_id).maybeSingle()
    if (plan) { planName = plan.name; maxInstances = plan.max_instances }
  }

  const isTrial = (planName ?? "").toLowerCase().includes("trial") || (planName ?? "").includes("تجريبي") || (planName ?? "") === "" || Number((planName && sub?.plan_id) ? 1 : 0) === 0 && !sub
  const pastDue = sub?.status === "past_due"

  // Days left: prefer subscription period end; fall back to 7-day trial from signup
  let daysLeft: number | null = null
  let periodEnd: string | null = null
  if (sub?.current_period_end) {
    periodEnd = sub.current_period_end
    daysLeft = Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  } else if (profile.created_at) {
    const end = new Date(profile.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    periodEnd = new Date(end).toISOString()
    daysLeft = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  // count current numbers
  const { count: numbersUsed } = await supabase.from("instances").select("id", { count: "exact", head: true }).eq("user_id", user.id)

  return NextResponse.json({
    plan: planName,
    days_left: daysLeft,
    trial_end: periodEnd,
    is_trial: !sub?.plan_id,
    past_due: pastDue,
    balance: profile.balance ?? 0,
    status: profile.status ?? null,
    max_instances: maxInstances,
    numbers_used: numbersUsed ?? 0,
  })
}
