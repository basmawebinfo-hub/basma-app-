import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

/**
 * Replay the last REAL incoming WhatsApp message to a webhook destination URL.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { url, secret } = await req.json().catch(() => ({}))
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 })

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: insts } = await svc
    .from("instances")
    .select("id")
    .eq("user_id", user.id)
  const instanceIds = (insts ?? []).map((i) => i.id)
  if (instanceIds.length === 0) {
    return NextResponse.json({ error: "لا يوجد رقم مربوط بعد" }, { status: 400 })
  }

  const { data: ev } = await svc
    .from("webhook_events")
    .select("payload")
    .in("instance_id", instanceIds)
    .order("processed_at", { ascending: false })
    .limit(1)
    .single()

  if (!ev?.payload) {
    return NextResponse.json({ error: "لا توجد رسائل واردة بعد. ابعت رسالة للرقم أولاً ثم اضغط الزر." }, { status: 404 })
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Basma-Secret": secret } : {}),
      },
      body: JSON.stringify(ev.payload),
    })
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      message: res.ok ? "تم إرسال آخر رسالة حقيقية بنجاح!" : `فشل (${res.status})`,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
