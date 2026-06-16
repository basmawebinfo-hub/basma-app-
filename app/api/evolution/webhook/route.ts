import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getServiceClient()

    const event = (body.event as string) ?? ""
    const instanceName = (body.instance as string) ?? ""
    const data = body.data

    if (!event || !instanceName) return NextResponse.json({ ok: true })

    // CONNECTION_UPDATE
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const state = data?.state ?? data?.connection
      const statusMap: Record<string, string> = {
        open: "CONNECTED", close: "DISCONNECTED", connecting: "CONNECTING",
      }
      await supabase.from("instances")
        .update({ status: statusMap[state] ?? "DISCONNECTED", updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    // QRCODE_UPDATED
    if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
      await supabase.from("instances")
        .update({ status: "QR_READY", updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    // MESSAGES_UPSERT
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      // Get instance from DB
      const { data: instance } = await supabase
        .from("instances").select("id, user_id")
        .eq("instance_name", instanceName).single()

      if (!instance) return NextResponse.json({ ok: true })

      // Parse messages array - Evolution API sends different formats
      let messages: Record<string, unknown>[] = []
      if (Array.isArray(data)) {
        messages = data
      } else if (data?.messages && Array.isArray(data.messages)) {
        messages = data.messages
      } else if (data && typeof data === "object") {
        messages = [data]
      }

      for (const msg of messages) {
        const key = msg.key as Record<string, unknown> ?? {}
        const remoteJid = (key.remoteJid as string) ?? ""
        if (!remoteJid || remoteJid.endsWith("@g.us")) continue

        const messageId = (key.id as string) ?? ""
        const fromMe = (key.fromMe as boolean) ?? false
        const ts = msg.messageTimestamp
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString()

        const msgContent = (msg.message as Record<string, unknown>) ?? {}
        const text =
          (msgContent.conversation as string) ??
          ((msgContent.extendedTextMessage as Record<string, unknown>)?.text as string) ??
          ((msgContent.imageMessage as Record<string, unknown>)?.caption as string) ??
          null

        const pushName = (msg.pushName as string) ?? null

        // Upsert contact
        const { data: contact } = await supabase.from("contacts")
          .upsert(
            { instance_id: instance.id, remote_jid: remoteJid, push_name: pushName },
            { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
          )
          .select("id").single()

        // Upsert chat
        const { data: chat } = await supabase.from("chats")
          .upsert(
            { instance_id: instance.id, remote_jid: remoteJid, last_message_at: ts, unread_count: fromMe ? 0 : 1 },
            { onConflict: "instance_id,remote_jid", ignoreDuplicates: false }
          )
          .select("id").single()

        if (!chat || !messageId) continue

        // Insert message
        await supabase.from("messages").upsert(
          {
            instance_id: instance.id,
            chat_id: chat.id,
            contact_id: contact?.id ?? null,
            message_id: messageId,
            from_me: fromMe,
            remote_jid: remoteJid,
            message_type: "TEXT",
            content: { text, raw: msgContent },
            status: fromMe ? "SENT" : "DELIVERED",
            timestamp: ts,
          },
          { onConflict: "instance_id,message_id", ignoreDuplicates: false }
        )
      }
    }

    // MESSAGES_UPDATE
    if (event === "messages.update" || event === "MESSAGES_UPDATE") {
      const updates = Array.isArray(data) ? data : [data]
      const { data: instance } = await supabase.from("instances")
        .select("id").eq("instance_name", instanceName).single()
      if (!instance) return NextResponse.json({ ok: true })

      for (const upd of updates as Record<string, unknown>[]) {
        const msgId = (upd?.key as Record<string, unknown>)?.id as string
        const statusRaw = (upd?.update as Record<string, unknown>)?.status as string
        if (!msgId || !statusRaw) continue
        const statusMap: Record<string, string> = {
          ERROR: "FAILED", PENDING: "PENDING", SERVER_ACK: "SENT",
          DELIVERY_ACK: "DELIVERED", READ: "READ", PLAYED: "READ",
        }
        await supabase.from("messages")
          .update({ status: statusMap[statusRaw] ?? "SENT" })
          .eq("instance_id", instance.id).eq("message_id", msgId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[basma] webhook error:", err)
    return NextResponse.json({ ok: true })
  }
}
