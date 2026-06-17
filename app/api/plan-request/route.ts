import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/plan-request — user requests a plan (admin will review)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const planId = body.plan_id as string
  if (!planId) return NextResponse.json({ error: "plan_id required" }, { status: 400 })

  // avoid duplicate pending requests
  await supabase.from("plan_requests").delete().eq("user_id", user.id).eq("status", "pending")
  const { error } = await supabase.from("plan_requests").insert({ user_id: user.id, plan_id: planId, status: "pending" })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
