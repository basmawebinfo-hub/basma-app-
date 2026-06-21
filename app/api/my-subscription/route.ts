import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/my-subscription — current user's plan + days left
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, balance, status, created_at")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ plan: null })

  // Compute days left from plan_expires_at
  let daysLeft: number | null = null
  if (profile.plan_expires_at) {
    const ms = new Date(profile.plan_expires_at).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
  }

  // Is this a free/trial plan?
  const planName = (profile.plan ?? "").toLowerCase()
  const isTrial = planName === "" || planName.includes("trial") || planName.includes("تجريبي") || planName.includes("free")

  return NextResponse.json({
    plan: profile.plan ?? null,
    plan_expires_at: profile.plan_expires_at ?? null,
    days_left: daysLeft,
    is_trial: isTrial,
    balance: profile.balance ?? 0,
    status: profile.status ?? null,
  })
}
