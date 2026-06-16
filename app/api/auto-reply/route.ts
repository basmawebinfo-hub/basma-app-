import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase.from("auto_reply_rules")
    .select("*, instances ( display_name )")
    .eq("user_id", user.id).order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, instance_id, trigger_type, keywords, reply_text, away_start, away_end } = body

  if (!name || !trigger_type || !reply_text) {
    return NextResponse.json({ error: "name, trigger_type, reply_text required" }, { status: 400 })
  }

  const { data, error } = await supabase.from("auto_reply_rules").insert({
    user_id: user.id, instance_id: instance_id || null, name, trigger_type,
    keywords: keywords ?? [], reply_text,
    away_start: away_start || null, away_end: away_end || null, is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body = await req.json()
  const { data, error } = await supabase.from("auto_reply_rules")
    .update(body).eq("id", id).eq("user_id", user.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await supabase.from("auto_reply_rules").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
