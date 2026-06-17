import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin, adminService, logAdminAction } from "@/lib/admin"

// POST /api/admin/admins — manage admin roles (SUPER ADMIN ONLY)
// Body: { action: "promote"|"demote"|"create", user_id?, email?, password? }
export async function POST(req: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

  const db = adminService()
  const body = await req.json().catch(() => ({}))
  const action = body.action as string

  switch (action) {
    // رقّي مستخدم موجود لأدمن
    case "promote": {
      const uid = body.user_id as string
      if (!uid) return NextResponse.json({ error: "user_id required" }, { status: 400 })
      const { data: p } = await db.from("profiles").select("role").eq("id", uid).single()
      if (p?.role === "super_admin") return NextResponse.json({ error: "Cannot modify a super_admin" }, { status: 403 })
      await db.from("profiles").update({ role: "admin" }).eq("id", uid)
      await logAdminAction(gate.userId, "promote_admin", "user", uid, {})
      return NextResponse.json({ ok: true, role: "admin" })
    }
    // نزّل أدمن لمستخدم عادي
    case "demote": {
      const uid = body.user_id as string
      if (!uid) return NextResponse.json({ error: "user_id required" }, { status: 400 })
      const { data: p } = await db.from("profiles").select("role").eq("id", uid).single()
      if (p?.role === "super_admin") return NextResponse.json({ error: "Cannot modify a super_admin" }, { status: 403 })
      await db.from("profiles").update({ role: "user" }).eq("id", uid)
      await logAdminAction(gate.userId, "demote_admin", "user", uid, {})
      return NextResponse.json({ ok: true, role: "user" })
    }
    // أنشئ حساب أدمن جديد من الصفر
    case "create": {
      const email = (body.email as string ?? "").trim()
      const password = body.password as string
      if (!email || !password) return NextResponse.json({ error: "email & password required" }, { status: 400 })
      const { data: created, error } = await db.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name: body.full_name ?? "Admin" },
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      const uid = created.user?.id
      if (uid) {
        await db.from("profiles").upsert({ id: uid, email, full_name: body.full_name ?? "Admin", role: "admin", status: "active" }, { onConflict: "id" })
      }
      await logAdminAction(gate.userId, "create_admin", "user", uid ?? null, { email })
      return NextResponse.json({ ok: true, user_id: uid })
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
