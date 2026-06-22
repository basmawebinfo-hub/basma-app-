import { NextRequest, NextResponse } from "next/server"
import { sendTelegram } from "@/lib/telegram"

// TEMPORARY test endpoint — delete after verifying telegram delivery
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key !== "059199b964439c2e") return NextResponse.json({ error: "no" }, { status: 401 })
  const chatId = req.nextUrl.searchParams.get("chat") ?? ""
  const ok = await sendTelegram(chatId, "🧪 <b>اختبار رسائل بصمة</b>\nهذه رسالة اختبار للتأكد من عمل التليجرام. إذا وصلتك فكل شيء يعمل ✅")
  return NextResponse.json({ sent: ok, token_configured: !!process.env.TELEGRAM_BOT_TOKEN })
}
