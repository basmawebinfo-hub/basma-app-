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
    .select("id, email, full_name, company, role, status, balance, plan, plan_expires_at, max_instances, max_messages, created_at")
    .order("created_at", { ascending: false })

  const users = profiles ?? []
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

  const instCount = new Map<string, number>()
  const instConnected = new Map<string, number>()
  for (const i of (instances ?? []) as { user_id: string; status: string }[]) {
    instCount.set(i.user_id, (instCount.get(i.user_id) ?? 0) + 1)
    if (i.status === "CONNECTED") instConnected.set(i.user_id, (instConnected.get(i.user_id) ?? 0) + 1)
  }

  const enriched = users.map((u) => ({
    ...u,
    instances_total: instCount.get(u.id) ?? 0,
    instances_connected: instConnected.get(u.id) ?? 0,
    messages_sent: sent.get(u.id) ?? 0,
    messages_received: received.get(u.id) ?? 0,
  }))

  return NextResponse.json({ users: enriched })
}
