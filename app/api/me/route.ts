import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserPlan } from "@/lib/plan"

// GET /api/me — current user's balance, plan, and credit history
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance, status, full_name, email")
    .eq("id", user.id)
    .single()

  const plan = await getUserPlan(user.id)

  // Daily cost + days left based on the plan price (monthly / 30)
  let monthlyPrice = 0
  if (plan.plan_id) {
    const { data: planRow } = await supabase.from("plans").select("price_monthly").eq("id", plan.plan_id).single()
    monthlyPrice = Number(planRow?.price_monthly ?? 0)
  }
  const balance = Number(profile?.balance ?? 0)
  const dailyCost = monthlyPrice > 0 ? Number((monthlyPrice / 30).toFixed(2)) : 0
  const daysLeft = dailyCost > 0 ? Math.floor(balance / dailyCost) : null

  const { data: tx } = await supabase
    .from("credit_transactions")
    .select("amount, type, reason, balance_after, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return NextResponse.json({
    balance,
    status: profile?.status ?? "active",
    plan_name: plan.plan_name,
    max_instances: plan.max_instances,
    max_messages: plan.max_messages_mo,
    monthly_price: monthlyPrice,
    daily_cost: dailyCost,
    days_left: daysLeft,
    transactions: tx ?? [],
  })
}
