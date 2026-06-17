import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService, logAdminAction } from "@/lib/admin"

// POST /api/admin/users/[id]/action  — perform an admin action on a user
// Body: { action: "...", ...params }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const { id: targetUserId } = await params
  const db = adminService()
  const body = await req.json().catch(() => ({}))
  const action = body.action as string

  // Load target profile
  const { data: profile } = await db.from("profiles").select("*").eq("id", targetUserId).single()
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 })

  switch (action) {
    // ── Suspend / Activate ──
    case "suspend":
    case "activate": {
      const status = action === "suspend" ? "suspended" : "active"
      await db.from("profiles").update({ status, updated_at: new Date().toISOString() }).eq("id", targetUserId)
      await logAdminAction(gate.userId, action, "user", targetUserId, { status })
      return NextResponse.json({ ok: true, status })
    }

    // ── Top up / adjust balance ──
    case "topup":
    case "debit": {
      const amount = Number(body.amount)
      if (!amount || amount <= 0) return NextResponse.json({ error: "amount must be > 0" }, { status: 400 })
      const delta = action === "topup" ? amount : -amount
      const newBalance = Number(profile.balance ?? 0) + delta
      await db.from("profiles").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", targetUserId)
      await db.from("credit_transactions").insert({
        user_id: targetUserId, amount: delta,
        type: action === "topup" ? "topup" : "debit",
        reason: body.reason ?? null, balance_after: newBalance, created_by: gate.userId,
      })
      await logAdminAction(gate.userId, action, "user", targetUserId, { amount: delta, newBalance })
      return NextResponse.json({ ok: true, balance: newBalance })
    }

    // ── Change plan ──
    case "set_plan": {
      const plan = body.plan as string
      if (!["free","starter","pro","enterprise"].includes(plan))
        return NextResponse.json({ error: "invalid plan" }, { status: 400 })
      await db.from("profiles").update({
        plan, plan_expires_at: body.expires_at ?? null, updated_at: new Date().toISOString(),
      }).eq("id", targetUserId)
      await logAdminAction(gate.userId, "set_plan", "user", targetUserId, { plan })
      return NextResponse.json({ ok: true, plan })
    }

    // ── Update limits ──
    case "set_limits": {
      const patch: Record<string, number> = {}
      if (body.max_instances != null) patch.max_instances = Number(body.max_instances)
      if (body.max_messages != null) patch.max_messages = Number(body.max_messages)
      await db.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", targetUserId)
      await logAdminAction(gate.userId, "set_limits", "user", targetUserId, patch)
      return NextResponse.json({ ok: true, ...patch })
    }

    // ── Send in-app notification (talk to user) ──
    case "notify": {
      if (!body.title) return NextResponse.json({ error: "title required" }, { status: 400 })
      await db.from("notifications").insert({
        user_id: targetUserId, title: body.title, body: body.body ?? null,
        level: body.level ?? "info", created_by: gate.userId,
      })
      await logAdminAction(gate.userId, "notify", "user", targetUserId, { title: body.title })
      return NextResponse.json({ ok: true })
    }

    // ── Save admin notes ──
    case "set_notes": {
      await db.from("profiles").update({ notes: body.notes ?? null }).eq("id", targetUserId)
      return NextResponse.json({ ok: true })
    }

    // ── Delete user (and cascade their data) ──
    case "delete": {
      // delete auth user (cascades to profiles/instances/... via FKs)
      await db.auth.admin.deleteUser(targetUserId).catch(() => {})
      await db.from("profiles").delete().eq("id", targetUserId)
      await logAdminAction(gate.userId, "delete_user", "user", targetUserId, {})
      return NextResponse.json({ ok: true, deleted: true })
    }

    default:
      return NextResponse.json({ error: "Unknown action: " + action }, { status: 400 })
  }
}
