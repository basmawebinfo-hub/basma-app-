import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService, logAdminAction } from "@/lib/admin"
import { sendTelegram } from "@/lib/telegram"
import { setUserPlan } from "@/lib/plan"

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

    // ── Change plan (writes to subscriptions) ──
    case "set_plan": {
      const planId = body.plan_id as string
      if (!planId) return NextResponse.json({ error: "plan_id required" }, { status: 400 })
      const { data: pl } = await db.from("plans").select("id").eq("id", planId).single()
      if (!pl) return NextResponse.json({ error: "invalid plan_id" }, { status: 400 })
      await setUserPlan(targetUserId, planId, body.expires_at ?? undefined)
      await logAdminAction(gate.userId, "set_plan", "user", targetUserId, { plan_id: planId })
      return NextResponse.json({ ok: true, plan_id: planId })
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
      // Also push to Telegram if the user linked it
      if (profile.telegram_chat_id) {
        await sendTelegram(profile.telegram_chat_id, `<b>${body.title}</b>\n${body.body ?? ""}`)
      }
      await logAdminAction(gate.userId, "notify", "user", targetUserId, { title: body.title })
      return NextResponse.json({ ok: true })
    }

    // ── Reset password (admin sets a new password for the user) ──
    case "reset_password": {
      const newPass = body.password as string
      if (!newPass || newPass.length < 6) return NextResponse.json({ error: "كلمة سر 6 أحرف على الأقل" }, { status: 400 })
      const { error } = await db.auth.admin.updateUserById(targetUserId, { password: newPass })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      // notify the user
      await db.from("notifications").insert({
        user_id: targetUserId, title: "تم تغيير كلمة المرور",
        body: "قام المسؤول بتعيين كلمة مرور جديدة لحسابك بناءً على طلبك.", level: "warning",
      })
      await logAdminAction(gate.userId, "reset_password", "user", targetUserId, {})
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
