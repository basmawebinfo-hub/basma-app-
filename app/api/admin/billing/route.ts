import { NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const db = adminService()
  const { data: tx } = await db.from("credit_transactions")
    .select("id, user_id, amount, type, reason, balance_after, created_at")
    .order("created_at", { ascending: false }).limit(200)
  const { data: profiles } = await db.from("profiles").select("id, email, balance, plan")
  const emailMap = new Map((profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]))
  const enriched = (tx ?? []).map((t: { user_id: string; [k: string]: unknown }) => ({ ...t, email: emailMap.get(t.user_id) ?? "—" }))
  return NextResponse.json({ transactions: enriched, balances: profiles ?? [] })
}
