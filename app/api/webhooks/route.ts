import { NextRequest, NextResponse } from "next/server"
import { notifyUser } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"

// GET /api/webhooks — list configs for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("webhook_configs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/webhooks — create a new config
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, destination_type, destination_url, destination_email, events, secret } = body

  if (!name || !destination_type || !events?.length) {
    return NextResponse.json({ error: "name, destination_type, and events are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("webhook_configs")
    .insert({
      user_id: user.id,
      name,
      destination_type: destination_type.toUpperCase(),
      destination_url: destination_url || null,
      destination_email: destination_email || null,
      events,
      secret: secret || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await notifyUser(user.id, "تمت إضافة Webhook", "تمت إضافة الـ Webhook بنجاح وهو نشط الآن.", "\ud83d\udd17")
  return NextResponse.json(data)
}

// PATCH /api/webhooks?id=xxx — toggle active / update
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body = await req.json()

  const { data, error } = await supabase
    .from("webhook_configs")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/webhooks?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { error } = await supabase
    .from("webhook_configs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
