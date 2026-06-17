import { NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const { data: logs } = await db.from("admin_audit_log")
    .select("id, admin_id, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false }).limit(200)
  const { data: profiles } = await db.from("profiles").select("id, email")
  const emailMap = new Map((profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]))
  const enriched = (logs ?? []).map((l: { admin_id: string; [k: string]: unknown }) => ({ ...l, admin_email: emailMap.get(l.admin_id) ?? "—" }))
  return NextResponse.json({ logs: enriched })
}
