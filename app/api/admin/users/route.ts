import { NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

// GET /api/admin/users — full user list with stats (admin only)
export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const db = adminService()

  // All profiles
  const { data: profiles } = await db
    .from("profiles")
    .select("id, email, full_name, company, role, status, balance, plan, plan_expires_at, max_instances, max_messages, whatsapp, custom_max_instances, avatar_url, created_at")
    .order("created_at", { ascending: false })

  // Exclude admins/owners from the customer management list — they are not customers
  const users = (profiles ?? []).filter((u) => u.role !== "admin" && u.role !== "super_admin")
  const ids = users.map((u) => u.id)

  // Instance counts per user
  const { data: instances } = await db.from("instances").select("user_id, status").in("user_id", ids.length ? ids : ["x"])
  // Message counts per instance -> map to user
  const { data: instOwners } = await db.from("instances").select("id, user_id").in("user_id", ids.length ? ids : ["x"])
  const instToUser = new Map((instOwners ?? []).map((i: { id: string; user_id: string }) => [i.id, i.user_id]))

  const { data: msgs } = await db.from("messages").select("instance_id, from_me")
  const sent = new Map<string, number>()
  const received = new Map<string, number>()
  for (const m of (msgs ?? []) as { instance_id: string; from_me: boolean }[]) {
    const uid = instToUser.get(m.instance_id)
    if (!uid) continue
    if (m.from_me) sent.set(uid, (sent.get(uid) ?? 0) + 1)
    else received.set(uid, (received.get(uid) ?? 0) + 1)
  }

  // Plans + subscriptions (the real source of plan/limits)
  const { data: subs } = await db.from("subscriptions").select("user_id, plan_id, status, current_period_end, created_at")
  const { data: plansList } = await db.from("plans").select("id, name, max_instances, max_messages_mo, price_monthly")
  // pending plan requests
  const { data: reqs } = await db.from("plan_requests").select("user_id, plan_id, created_at").eq("status", "pending").order("created_at", { ascending: false })
  const reqByUser = new Map<string, string>()
  for (const rq of (reqs ?? []) as { user_id: string; plan_id: string }[]) {
    if (!reqByUser.has(rq.user_id)) reqByUser.set(rq.user_id, rq.plan_id)
  }
  const planById = new Map((plansList ?? []).map((p: { id: string; name: string; max_instances: number; max_messages_mo: number; price_monthly?: number }) => [p.id, p]))
  const subByUser = new Map((subs ?? []).map((s: { user_id: string; plan_id: string; status: string; current_period_end: string|null }) => [s.user_id, s]))

  const instCount = new Map<string, number>()
  const instConnected = new Map<string, number>()
  for (const i of (instances ?? []) as { user_id: string; status: string }[]) {
    instCount.set(i.user_id, (instCount.get(i.user_id) ?? 0) + 1)
    if (i.status === "CONNECTED") instConnected.set(i.user_id, (instConnected.get(i.user_id) ?? 0) + 1)
  }

  const enriched = users.map((u) => {
    const sub = subByUser.get(u.id)
    const plan = sub ? planById.get(sub.plan_id) : null
    const monthly = Number((plan as { price_monthly?: number })?.price_monthly ?? 0)
    const dailyCost = monthly > 0 ? monthly / 30 : 0
    const daysLeft = dailyCost > 0 ? Math.floor(Number(u.balance ?? 0) / dailyCost) : null
    const reqPlanId = reqByUser.get(u.id)
    const reqPlan = reqPlanId ? planById.get(reqPlanId) : null
    const planMax = (plan as { max_instances?: number })?.max_instances ?? 1
    const customMax = (u as { custom_max_instances?: number | null }).custom_max_instances
    const effectiveMax = customMax != null ? customMax : planMax
    const isCustom = customMax != null
    return {
      ...u,
      plan_name: plan?.name ?? "—",
      requested_plan: reqPlan?.name ?? null,
      effective_max_instances: effectiveMax,
      is_custom_limit: isCustom,
      days_left: daysLeft,
      avatar_url: (u as { avatar_url?: string }).avatar_url ?? null,
      is_trial: monthly === 0,
      trial_day: (monthly === 0 && sub && (sub as { created_at?: string }).created_at) ? Math.floor((Date.now() - new Date((sub as { created_at: string }).created_at).getTime()) / 86400000) + 1 : null,
      plan_max_instances: plan?.max_instances ?? 1,
      plan_max_messages: plan?.max_messages_mo ?? 500,
      sub_status: sub?.status ?? "none",
      period_end: sub?.current_period_end ?? null,
      instances_total: instCount.get(u.id) ?? 0,
      instances_connected: instConnected.get(u.id) ?? 0,
      messages_sent: sent.get(u.id) ?? 0,
      messages_received: received.get(u.id) ?? 0,
    }
  })

  return NextResponse.json({ users: enriched })
}
