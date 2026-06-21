import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// POST /api/make/instagram
// Make sends: { secret, type: "comment"|"dm", text, from_username, from_id, comment_id, media_id }
// BASMA matches a rule and returns: { action, reply_comment, reply_dm } for Make to execute.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { secret, type, text } = body as { secret?: string; type?: string; text?: string }

  if (!secret) return NextResponse.json({ error: "Missing secret" }, { status: 401 })

  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1) Identify the user by the webhook secret
  const { data: conn } = await db.from("make_connections").select("user_id, is_active").eq("webhook_secret", secret).maybeSingle()
  if (!conn || !conn.is_active) return NextResponse.json({ error: "Invalid secret" }, { status: 401 })

  const userId = conn.user_id
  const incoming = (text ?? "").toLowerCase().trim()
  const triggerType = type === "dm" ? "dm" : "comment"

  // 2) Load this user's active rules for this trigger type
  const { data: rules } = await db
    .from("instagram_rules")
    .select("id, match_type, keyword, reply_comment, reply_dm")
    .eq("user_id", userId)
    .eq("is_active", true)
    .eq("trigger_type", triggerType)

  // 3) Find the first matching rule
  let matched: { id: string; reply_comment?: string; reply_dm?: string; keyword?: string } | null = null
  for (const r of rules ?? []) {
    const kw = (r.keyword ?? "").toLowerCase().trim()
    const m = r.match_type
    if (m === "any") { matched = r; break }
    if (m === "exact" && incoming === kw) { matched = r; break }
    if (m === "contains" && kw && incoming.includes(kw)) { matched = r; break }
  }

  // 4) Log + respond
  if (!matched) {
    await db.from("instagram_logs").insert({ user_id: userId, event_type: triggerType, action: "no_match", status: "skipped", detail: incoming.slice(0, 200) })
    return NextResponse.json({ action: "none" })
  }

  await db.from("instagram_logs").insert({
    user_id: userId, rule_id: matched.id, event_type: triggerType,
    matched_keyword: matched.keyword ?? "", action: "reply", status: "success", detail: incoming.slice(0, 200),
  })

  // Make reads these fields and performs the actual send
  return NextResponse.json({
    action: "reply",
    reply_comment: matched.reply_comment ?? "",
    reply_dm: matched.reply_dm ?? "",
  })
}
