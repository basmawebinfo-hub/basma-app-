import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const TRIAL_DAYS = 7

// GET /api/my-subscription — current user's plan + trial days left
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

  const planName = (profile.plan ?? "").toLowerCase()
  const isTrial = planName === "" || planName.includes("trial") || planName.includes("تجريبي") || planName.includes("free")

  // Trial = 7 days from signup (created_at). Paid plans use plan_expires_at if present.
  let daysLeft: number | null = null
  let trialEnd: string | null = null
  if (isTrial && profile.created_at) {
    const end = new Date(profile.created_at).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    trialEnd = new Date(end).toISOString()
    daysLeft = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)))
  } else if (profile.plan_expires_at) {
    const end = new Date(profile.plan_expires_at).getTime()
    trialEnd = profile.plan_expires_at
    daysLeft = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  return NextResponse.json({
    plan: profile.plan ?? null,
    days_left: daysLeft,
    trial_end: trialEnd,
    is_trial: isTrial,
    balance: profile.balance ?? 0,
    status: profile.status ?? null,
  })
}
