import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendText, sendPresence } from "@/lib/evolution"
import { humanDelay, typingDuration, spinMessage, isQuietHour, shouldTakeBreak, breakDuration, sleep } from "@/lib/anti-ban"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = params
  const { data: campaign } = await supabase.from("campaigns")
    .select("*, instances ( instance_name, status )")
    .eq("id", id).eq("user_id", user.id).single()

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 })

  const inst = campaign.instances as { instance_name: string; status: string }
  if (inst.status !== "CONNECTED") return NextResponse.json({ error: "Instance is not connected" }, { status: 400 })
  if (campaign.status === "running") return NextResponse.json({ error: "Campaign is already running" }, { status: 400 })

  await supabase.from("campaigns").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", id)

  const { data: contacts } = await supabase.from("campaign_contacts")
    .select("id, phone, name").eq("campaign_id", id).eq("status", "pending")

  if (!contacts?.length) {
    await supabase.from("campaigns").update({ status: "completed" }).eq("id", id)
    return NextResponse.json({ ok: true, sent: 0 })
  }

  runCampaign(id, inst.instance_name, campaign.message_text, contacts, campaign.delay_seconds).catch(console.error)
  return NextResponse.json({ ok: true, total: contacts.length })
}

async function runCampaign(
  campaignId: string, instanceName: string, messageText: string,
  contacts: { id: string; phone: string; name: string | null }[], delaySeconds: number
) {
  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  let sentCount = 0, failedCount = 0

  // Base delay: respect user setting but enforce a safe minimum range.
  const minGap = Math.max(delaySeconds, 4)
  const maxGap = Math.max(delaySeconds + 6, 12)

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]

    // ── Anti-ban: pause during quiet hours (don't blast at night) ──
    while (isQuietHour()) {
      await service.from("campaigns").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", campaignId)
      await sleep(5 * 60 * 1000) // re-check every 5 min
    }

    try {
      // ── Anti-ban: spin the message so each send is slightly different ──
      const text = spinMessage(messageText, { name: contact.name ?? "", phone: contact.phone })

      // ── Anti-ban: show "typing…" for a human-like duration before sending ──
      try {
        await sendPresence(instanceName, contact.phone, "composing", typingDuration(text))
        await sleep(typingDuration(text))
      } catch { /* presence is best-effort */ }

      await sendText(instanceName, contact.phone, text)
      await service.from("campaign_contacts").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", contact.id)
      sentCount++
    } catch (err) {
      await service.from("campaign_contacts").update({ status: "failed", error: String(err) }).eq("id", contact.id)
      failedCount++
    }

    await service.from("campaigns").update({ sent_count: sentCount, failed_count: failedCount, updated_at: new Date().toISOString() }).eq("id", campaignId)

    if (i < contacts.length - 1) {
      // ── Anti-ban: longer "coffee break" every 25 messages ──
      if (shouldTakeBreak(sentCount)) {
        await sleep(breakDuration())
      } else {
        // ── Anti-ban: randomized human-like gap (not a fixed interval) ──
        await sleep(humanDelay(minGap, maxGap))
      }
    }
  }

  await service.from("campaigns").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", campaignId)
}
