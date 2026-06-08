import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// Use service role to bypass RLS — webhook calls have no user session
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/evolution/webhook
// Evolution API sends ALL instance events here
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getServiceClient()

    const event = body.event as string
    const instanceName = body.instance as string
    const data = body.data

    if (!event || !instanceName) {
      return NextResponse.json({ ok: true }) // ignore malformed
    }

    // --- CONNECTION_UPDATE: sync instance status ---
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const state = data?.state ?? data?.connection
      const statusMap: Record<string, string> = {
        open: "CONNECTED",
        close: "DISCONNECTED",
        connecting: "CONNECTING",
      }
      const newStatus = statusMap[state] ?? "DISCONNECTED"

      await supabase
        .from("instances")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    // --- MESSAGES_UPSERT: save incoming messages ---
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      const messages: any[] = Array.isArray(data) ? data : data?.messages ?? [data]

      // Resolve instance DB id
      const { data: instance } = await supabase
        .from("instances")
        .select("id, user_id")
        .eq("instance_name", instanceName)
        .single()

      if (!instance) return NextResponse.json({ ok: true })

      for (const msg of messages) {
        const remoteJid: string =
          msg.key?.remoteJid ?? msg.remoteJid ?? ""
        if (!remoteJid || remoteJid.endsWith("@g.us")) continue // skip groups for now

        const messageId: string = msg.key?.id ?? msg.id ?? ""
        const fromMe: boolean = msg.key?.fromMe ?? false
        const timestamp = msg.messageTimestamp
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString()

        // Extract text content
        const text =
          msg.message?.conversation ??
          msg.message?.extendedTextMessage?.text ??
          msg.message?.imageMessage?.caption ??
          msg.message?.videoMessage?.caption ??
          null

        // Upsert contact
        const pushName = msg.pushName ?? null
        const { data: contact } = await supabase
          .from("contacts")
          .upsert(
            {
              instance_id: instance.id,
              remote_jid: remoteJid,
              push_name: pushName,
            },
            { onConflict: "instance_id,remote_jid" }
          )
          .select("id")
          .single()

        // Upsert chat
        const { data: chat } = await supabase
          .from("chats")
          .upsert(
            {
              instance_id: instance.id,
              remote_jid: remoteJid,
              last_message_at: timestamp,
              unread_count: fromMe ? 0 : 1,
            },
            { onConflict: "instance_id,remote_jid" }
          )
          .select("id")
          .single()

        if (!chat || !messageId) continue

        // Upsert message
        await supabase
          .from("messages")
          .upsert(
            {
              instance_id: instance.id,
              chat_id: chat.id,
              contact_id: contact?.id ?? null,
              message_id: messageId,
              from_me: fromMe,
              remote_jid: remoteJid,
              message_type: "TEXT",
              content: { text, raw: msg.message ?? {} },
              status: fromMe ? "SENT" : "DELIVERED",
              timestamp,
            },
            { onConflict: "instance_id,message_id" }
          )
      }
    }

    // --- MESSAGES_UPDATE: update delivery status ---
    if (event === "messages.update" || event === "MESSAGES_UPDATE") {
      const updates: any[] = Array.isArray(data) ? data : [data]
      for (const upd of updates) {
        const msgId = upd.key?.id
        const statusRaw = upd.update?.status
        if (!msgId || !statusRaw) continue

        const statusMap: Record<string, string> = {
          ERROR: "FAILED",
          PENDING: "PENDING",
          SERVER_ACK: "SENT",
          DELIVERY_ACK: "DELIVERED",
          READ: "READ",
          PLAYED: "READ",
        }
        const newStatus = statusMap[statusRaw] ?? "SENT"

        const { data: instance } = await supabase
          .from("instances")
          .select("id")
          .eq("instance_name", instanceName)
          .single()

        if (!instance) continue

        await supabase
          .from("messages")
          .update({ status: newStatus })
          .eq("instance_id", instance.id)
          .eq("message_id", msgId)
      }
    }

    // --- QRCODE_UPDATED: mark instance as QR_READY ---
    if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
      await supabase
        .from("instances")
        .update({ status: "QR_READY", updated_at: new Date().toISOString() })
        .eq("instance_name", instanceName)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] Evolution webhook error:", err)
    return NextResponse.json({ ok: true }) // always 200 to avoid Evolution retries
  }
}
