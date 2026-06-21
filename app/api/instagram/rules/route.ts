import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: list user's IG rules
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data } = await supabase.from("instagram_rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  return NextResponse.json({ rules: data ?? [] })
}

// POST: create a rule
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const { error } = await supabase.from("instagram_rules").insert({
    user_id: user.id,
    name: b.name ?? null,
    trigger_type: b.trigger_type === "dm" ? "dm" : "comment",
    match_type: ["contains", "exact", "any"].includes(b.match_type) ? b.match_type : "contains",
    keyword: b.keyword ?? null,
    reply_comment: b.reply_comment ?? null,
    reply_dm: b.reply_dm ?? null,
    is_active: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// DELETE: ?id=...
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await supabase.from("instagram_rules").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
