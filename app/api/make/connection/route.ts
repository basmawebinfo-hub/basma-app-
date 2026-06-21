import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import crypto from "crypto"

// GET: returns the user's Make webhook URL + secret (creates one if missing)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  let { data: conn } = await db.from("make_connections").select("webhook_secret, ig_username, is_active").eq("user_id", user.id).maybeSingle()

  if (!conn) {
    const secret = crypto.randomBytes(20).toString("hex")
    const { data: created } = await db.from("make_connections").insert({ user_id: user.id, webhook_secret: secret }).select("webhook_secret, ig_username, is_active").single()
    conn = created
  }

  return NextResponse.json({
    webhook_url: "https://www.basmaweb.com/api/make/instagram",
    secret: conn?.webhook_secret ?? null,
    ig_username: conn?.ig_username ?? null,
    is_active: conn?.is_active ?? true,
  })
}
