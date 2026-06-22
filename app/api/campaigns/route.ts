import { NextRequest, NextResponse } from "next/server"
import { notifyUser } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("campaigns")
    .select("*, instances ( display_name, status )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, instance_id, message_text, contacts, delay_seconds, scheduled_at } = body

  if (!name || !instance_id || !message_text || !contacts?.length) {
    return NextResponse.json({ error: "name, instance_id, message_text, contacts required" }, { status: 400 })
  }

  const { data: inst } = await supabase.from("instances").select("id, status").eq("id", instance_id).eq("user_id", user.id).single()
  if (!inst) return NextResponse.json({ error: "Instance not found" }, { status: 404 })

  const { data: campaign, error: campErr } = await supabase.from("campaigns").insert({
    user_id: user.id, instance_id, name, message_text,
    delay_seconds: delay_seconds ?? 5,
    scheduled_at: scheduled_at ?? null,
    status: scheduled_at ? "scheduled" : "draft",
    total_contacts: contacts.length,
  }).select().single()

  if (campErr) return NextResponse.json({ error: campErr.message }, { status: 500 })

  const contactRows = contacts.map((c: { phone: string; name?: string }) => ({
    campaign_id: campaign.id,
    phone: c.phone.replace(/[^0-9]/g, ""),
    name: c.name ?? null,
    status: "pending",
  }))

  await supabase.from("campaign_contacts").insert(contactRows)
  await notifyUser(user.id, "تم إنشاء حملة جديدة", `تم إنشاء الحملة "${campaign?.name ?? ""}" بنجاح وهي جاهزة للتشغيل.`, "\ud83d\udce2")
  return NextResponse.json(campaign)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await supabase.from("campaigns").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
