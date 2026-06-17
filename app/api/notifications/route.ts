import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/notifications — current user's notifications
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, level, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)
  return NextResponse.json({ notifications: data ?? [] })
}

// PATCH /api/notifications?id=xxx  — mark as read (or all)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  let q = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)
  if (id) q = q.eq("id", id)
  else q = q.eq("is_read", false)
  await q
  return NextResponse.json({ ok: true })
}
