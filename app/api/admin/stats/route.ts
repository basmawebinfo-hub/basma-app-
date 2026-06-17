import { NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

// GET /api/admin/stats — platform-wide overview (admin only)
export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const db = adminService()
  const count = async (table: string, filter?: (q: ReturnType<typeof db.from>) => unknown) => {
    let q = db.from(table).select("id", { count: "exact", head: true })
    if (filter) q = filter(q) as typeof q
    const { count: c } = await q
    return c ?? 0
  }

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [totalUsers, suspendedUsers, totalInstances, connectedInstances, totalMessages, messagesToday] =
    await Promise.all([
      count("profiles"),
      count("profiles", (q) => q.eq("status", "suspended")),
      count("instances"),
      count("instances", (q) => q.eq("status", "CONNECTED")),
      count("messages"),
      count("messages", (q) => q.gte("timestamp", todayStart.toISOString())),
    ])

  // Total balance across users + webhook delivery health
  const { data: balRows } = await db.from("profiles").select("balance")
  const totalBalance = (balRows ?? []).reduce((s: number, r: { balance: number }) => s + Number(r.balance ?? 0), 0)

  const { data: deliv } = await db.from("webhook_deliveries").select("status").gte("created_at", todayStart.toISOString())
  const dTotal = deliv?.length ?? 0
  const dOk = (deliv ?? []).filter((d: { status: string }) => d.status === "SUCCESS").length
  const webhookSuccess = dTotal ? Math.round((dOk / dTotal) * 100) : 100

  return NextResponse.json({
    total_users: totalUsers,
    suspended_users: suspendedUsers,
    total_instances: totalInstances,
    connected_instances: connectedInstances,
    total_messages: totalMessages,
    messages_today: messagesToday,
    total_balance: totalBalance,
    webhook_success_rate: webhookSuccess,
  })
}
