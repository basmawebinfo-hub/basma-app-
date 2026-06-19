import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"
import { getUserPlan } from "@/lib/plan"

// GET /api/admin/users/[id]/detail — full profile of one user
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const uid = params.id

  const { data: profile } = await db.from("profiles")
    .select("id, email, full_name, company, role, status, balance, plan, whatsapp, telegram_chat_id, telegram_linked_at, custom_max_instances, created_at")
    .eq("id", uid).single()
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const plan = await getUserPlan(uid)

  // instances
  const { data: instances } = await db.from("instances")
    .select("id, instance_name, display_name, phone, status, created_at")
    .eq("user_id", uid).order("created_at", { ascending: false })

  // credit transactions
  const { data: tx } = await db.from("credit_transactions")
    .select("amount, type, reason, balance_after, created_at")
    .eq("user_id", uid).order("created_at", { ascending: false }).limit(50)

  // API usage
  const { data: usage } = await db.from("api_usage_log")
    .select("endpoint, status, detail, created_at")
    .eq("user_id", uid).order("created_at", { ascending: false }).limit(50)

  // plan requests
  const { data: reqs } = await db.from("plan_requests")
    .select("plan_id, status, created_at")
    .eq("user_id", uid).order("created_at", { ascending: false }).limit(10)

  // message counts
  const instIds = (instances ?? []).map((i: { id: string }) => i.id)
  let sent = 0, received = 0
  if (instIds.length) {
    const { count: s } = await db.from("messages").select("id", { count: "exact", head: true }).in("instance_id", instIds).eq("from_me", true)
    const { count: r } = await db.from("messages").select("id", { count: "exact", head: true }).in("instance_id", instIds).eq("from_me", false)
    sent = s ?? 0; received = r ?? 0
  }

  return NextResponse.json({
    profile: {
      ...profile,
      plan_name: plan.plan_name,
      effective_max_instances: profile.custom_max_instances ?? plan.max_instances,
      telegram_linked: !!profile.telegram_chat_id,
    },
    instances: instances ?? [],
    transactions: tx ?? [],
    usage: usage ?? [],
    plan_requests: reqs ?? [],
    message_stats: { sent, received },
  })
}
