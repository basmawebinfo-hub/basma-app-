import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/user/usage — recent API calls for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data } = await supabase
    .from("api_usage_log")
    .select("endpoint, method, status, detail, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)
  // total this month
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
  const { count } = await supabase.from("api_usage_log").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).gte("created_at", monthStart.toISOString())
  return NextResponse.json({ calls: data ?? [], month_total: count ?? 0 })
}
