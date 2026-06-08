import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/webhooks/logs — last 50 delivery logs for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // First get config IDs owned by this user
  const { data: cfgIds } = await supabase
    .from("webhook_configs")
    .select("id")
    .eq("user_id", user.id)

  const ids = (cfgIds ?? []).map((c) => c.id)

  const { data, error } = await supabase
    .from("webhook_deliveries")
    .select(`
      id,
      status,
      attempts,
      last_attempt_at,
      response_status,
      error,
      created_at,
      webhook_configs ( name, destination_type, destination_url ),
      webhook_events ( event_type )
    `)
    .in("webhook_config_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
