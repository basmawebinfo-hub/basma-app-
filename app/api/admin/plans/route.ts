import { NextResponse } from "next/server"
import { requireAdmin, adminService } from "@/lib/admin"

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })
  const { data } = await adminService().from("plans")
    .select("id, name, price_monthly, max_instances, max_messages_mo, is_active")
    .eq("is_active", true).order("price_monthly")
  return NextResponse.json({ plans: data ?? [] })
}
