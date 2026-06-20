/** Telegram notifications helper (server-only). */

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ""

type InlineButton = { text: string; callback_data: string }

export async function sendTelegram(chatId: string, text: string, buttons?: InlineButton[][]): Promise<boolean> {
  if (!TG_TOKEN || !chatId) return false
  try {
    const payload: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" }
    if (buttons && buttons.length) payload.reply_markup = { inline_keyboard: buttons }
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Answer a callback query (removes the loading spinner on the button). */
export async function answerCallback(callbackId: string, text?: string): Promise<void> {
  if (!TG_TOKEN) return
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text: text ?? "" }),
    })
  } catch { /* ignore */ }
}
