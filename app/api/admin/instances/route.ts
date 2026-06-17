import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService, logAdminAction } from "@/lib/admin"

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const { data: instances } = await db.from("instances")
    .select("id, instance_name, display_name, phone, status, user_id, created_at")
    .order("created_at", { ascending: false })
  const { data: profiles } = await db.from("profiles").select("id, email")
  const emailMap = new Map((profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]))
  const enriched = (instances ?? []).map((i: { user_id: string; [k: string]: unknown }) => ({ ...i, owner_email: emailMap.get(i.user_id) ?? null }))
  return NextResponse.json({ instances: enriched })
}

// DELETE /api/admin/instances?id=xxx — admin force-delete an instance
export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const db = adminService()
  await db.from("instances").delete().eq("id", id)
  await logAdminAction(gate.userId, "delete_instance", "instance", id, {})
  return NextResponse.json({ ok: true })
}
