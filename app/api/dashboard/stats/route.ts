import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: instances } = await supabase
    .from("instances")
    .select("id, status")
    .eq("user_id", user.id)

  const instanceIds = (instances ?? []).map((i) => i.id)
  const fallback = ["00000000-0000-0000-0000-000000000000"]
  const ids = instanceIds.length ? instanceIds : fallback

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { count: messagesToday } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("instance_id", ids)
    .gte("timestamp", todayStart.toISOString())

  const { count: activeChats } = await supabase
    .from("chats")
    .select("id", { count: "exact", head: true })
    .in("instance_id", ids)
    .gte("last_message_at", yesterday.toISOString())

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const messagesWeek: { day: string; messages: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date()
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("instance_id", ids)
      .gte("timestamp", dayStart.toISOString())
      .lte("timestamp", dayEnd.toISOString())

    messagesWeek.push({ day: days[dayStart.getDay()], messages: count ?? 0 })
  }

  const { data: cfgIds } = await supabase
    .from("webhook_configs")
    .select("id")
    .eq("user_id", user.id)

  const configIds = (cfgIds ?? []).map((c) => c.id)

  const { data: deliveries } = await supabase
    .from("webhook_deliveries")
    .select("status")
    .in("webhook_config_id", configIds.length ? configIds : fallback)
    .gte("created_at", yesterday.toISOString())

  const total = deliveries?.length ?? 0
  const success = deliveries?.filter((d) => d.status === "SUCCESS").length ?? 0
  const webhookSuccessRate = total > 0 ? Math.round((success / total) * 100) : 100

  const { data: recentDeliveries } = await supabase
    .from("webhook_deliveries")
    .select(\`
      status, response_status, created_at,
      webhook_configs ( name, destination_url, destination_type ),
      webhook_events ( event_type )
    \`)
    .in("webhook_config_id", configIds.length ? configIds : fallback)
    .order("created_at", { ascending: false })
    .limit(10)

  const recentEvents = (recentDeliveries ?? []).map((d) => {
    const cfg = d.webhook_configs as { name: string; destination_url: string | null } | null
    const evt = d.webhook_events as { event_type: string } | null
    const diffMin = Math.round((Date.now() - new Date(d.created_at).getTime()) / 60000)
    const timeStr = diffMin < 1 ? "Just now" : diffMin < 60 ? \`\${diffMin}m ago\` : \`\${Math.round(diffMin / 60)}h ago\`
    return {
      event: evt?.event_type ?? "UNKNOWN",
      dest: cfg?.destination_url ?? cfg?.name ?? "—",
      status: d.status?.toLowerCase() ?? "pending",
      time: timeStr,
      code: d.response_status ?? 0,
    }
  })

  return NextResponse.json({
    messages_today: messagesToday ?? 0,
    active_chats: activeChats ?? 0,
    webhook_success_rate: webhookSuccessRate,
    avg_reply_time: "—",
    messages_week: messagesWeek,
    recent_events: recentEvents,
  })
}
