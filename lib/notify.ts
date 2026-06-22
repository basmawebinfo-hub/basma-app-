import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendTelegram } from "@/lib/telegram"

/**
 * Notify a user about an action they performed (or that happened to their account).
 * Sends a Telegram message (if they linked Telegram) AND stores an in-app notification.
 * Best-effort: never throws, so it can't break the main request flow.
 */
export async function notifyUser(userId: string, title: string, body: string, icon = "\u2705"): Promise<void> {
  if (!userId) return
  try {
    const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // in-app notification
    try { await db.from("notifications").insert({ user_id: userId, title, body, level: "info" }) } catch { /* ignore */ }
    // telegram (only if linked)
    const { data: prof } = await db.from("profiles").select("telegram_chat_id").eq("id", userId).maybeSingle()
    if (prof?.telegram_chat_id) {
      await sendTelegram(prof.telegram_chat_id, `${icon} <b>${title}</b>\n${body}`)
    }
  } catch { /* never break the caller */ }
}
