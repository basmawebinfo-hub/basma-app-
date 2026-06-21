import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ connected: false })
  const { data } = await supabase.from("instagram_accounts").select("ig_username").eq("user_id", user.id).maybeSingle()
  return NextResponse.json({ connected: !!data, username: data?.ig_username ?? null })
}
