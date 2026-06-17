import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, adminService, logAdminAction } from "@/lib/admin"
import { deleteInstance } from "@/lib/evolution"

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

  // Get the instance name first so we can also delete it from Evolution
  const { data: inst } = await db.from("instances").select("instance_name").eq("id", id).single()

  // Delete from Evolution server (best-effort — don't block if it's already gone)
  if (inst?.instance_name) {
    try { await deleteInstance(inst.instance_name) } catch { /* already gone on Evolution */ }
  }

  // Delete from our DB (cascades to messages/chats/contacts)
  await db.from("instances").delete().eq("id", id)
  await logAdminAction(gate.userId, "delete_instance", "instance", id, { instance_name: inst?.instance_name })
  return NextResponse.json({ ok: true })
}
