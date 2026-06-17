/** Telegram notifications helper (server-only). */

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ""

export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!TG_TOKEN || !chatId) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
    return res.ok
  } catch {
    return false
  }
}
