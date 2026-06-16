import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company, avatar_url")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    email: user.email,
    full_name: profile?.full_name ?? "",
    company: profile?.company ?? "",
    avatar_url: profile?.avatar_url ?? "",
  })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { full_name, company } = body

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, company, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
