import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/analytics — real analytics for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // user's instances
  const { data: insts } = await supabase.from("instances").select("id").eq("user_id", user.id)
  const ids = (insts ?? []).map((i: { id: string }) => i.id)
  if (!ids.length) {
    return NextResponse.json({ line: [], byHour: [], byType: [], topContacts: [], totals: { total: 0, sent: 0, received: 0 } })
  }

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: msgs } = await supabase
    .from("messages")
    .select("from_me, message_type, remote_jid, timestamp")
    .in("instance_id", ids)
    .gte("timestamp", since)
    .limit(50000)

  const all = msgs ?? []

  // Last 30 days line
  const dayMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dayMap.set(d.toISOString().slice(5, 10), 0)
  }
  // By hour 0-23
  const hourArr = Array.from({ length: 24 }, () => 0)
  // By type
  const typeMap = new Map<string, number>()
  // Top contacts
  const contactMap = new Map<string, { count: number; last: string }>()
  let sent = 0, received = 0

  for (const m of all as { from_me: boolean; message_type: string; remote_jid: string; timestamp: string }[]) {
    const dt = new Date(m.timestamp)
    const dk = dt.toISOString().slice(5, 10)
    if (dayMap.has(dk)) dayMap.set(dk, (dayMap.get(dk) ?? 0) + 1)
    hourArr[dt.getHours()]++
    const t = m.message_type || "TEXT"
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1)
    if (m.from_me) sent++; else received++
    const c = contactMap.get(m.remote_jid) ?? { count: 0, last: m.timestamp }
    c.count++; if (m.timestamp > c.last) c.last = m.timestamp
    contactMap.set(m.remote_jid, c)
  }

  const line = Array.from(dayMap.entries()).map(([day, messages]) => ({ day, messages }))
  const byHour = hourArr.map((messages, h) => ({ hour: `${h}:00`, messages }))
  const byType = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }))
  const topContacts = Array.from(contactMap.entries())
    .map(([jid, v]) => ({ phone: "+" + jid.replace(/@.*/, ""), count: v.count, last: v.last }))
    .sort((a, b) => b.count - a.count).slice(0, 10)

  return NextResponse.json({
    line, byHour, byType, topContacts,
    totals: { total: all.length, sent, received },
  })
}
