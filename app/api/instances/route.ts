import { NextRequest, NextResponse } from "next/server"
import { notifyUser } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { createInstance, deleteInstance, setInstanceWebhook } from "@/lib/evolution"
import { getUserPlan } from "@/lib/plan"

const WEBHOOK_EVENTS = [
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "SEND_MESSAGE",
  "CONNECTION_UPDATE",
  "QRCODE_UPDATED",
  "CONTACTS_UPSERT",
  "CHATS_UPSERT",
  "CHATS_UPDATE",
]

// GET /api/instances
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("instances")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── Auto-sync: drop "ghost" instances that no longer exist on Evolution ──
  // Prevents the count mismatch (DB says N, Evolution says 0).
  const rows = data ?? []
  if (rows.length > 0) {
    try {
      const live = await listEvolutionInstances() // names that actually exist on Evolution
      if (live !== null) {
        const liveSet = new Set(live)
        const ghosts = rows.filter((row) => !liveSet.has(row.instance_name)).map((row) => row.id)
        if (ghosts.length > 0) {
          await supabase.from("instances").delete().in("id", ghosts)
          return NextResponse.json(rows.filter((row) => liveSet.has(row.instance_name)))
        }
      }
    } catch { /* if Evolution is unreachable, return DB rows as-is */ }
  }

  return NextResponse.json(rows)
}

// POST /api/instances — create instance + auto-set webhook
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { display_name } = await req.json()
  if (!display_name?.trim()) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 })
  }

  // Enforce account status + per-plan instance limit (from subscriptions)
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, balance")
    .eq("id", user.id)
    .single()

  if (profile?.status === "suspended") {
    return NextResponse.json({ error: "Your account is suspended" }, { status: 403 })
  }

  const plan = await getUserPlan(user.id)

  const { count: currentCount } = await supabase
    .from("instances")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  const maxInstances = plan.max_instances ?? 1
  if ((currentCount ?? 0) >= maxInstances) {
    return NextResponse.json(
      { error: `وصلت إلى حد باقتك (${maxInstances} رقم). جدّد أو رقِّ باقتك لإضافة المزيد.` },
      { status: 403 }
    )
  }

  // Subscription is a fixed monthly plan — adding a number is free while under the
  // count limit. We only block if the subscription is past_due (needs renewal).
  const { data: subStatus } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle()
  if (subStatus?.status === "past_due") {
    return NextResponse.json(
      { error: "اشتراكك يحتاج تجديد. يرجى تجديد الرصيد لإعادة تفعيل أرقامك.", need_topup: true },
      { status: 402 }
    )
  }

  const slug = display_name.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20)
  const instance_name = `${user.id.slice(0, 8)}_${slug}_${Date.now()}`

  // 1. Create instance in Evolution API
  await createInstance(instance_name)


  // 2. Auto-set webhook in Evolution API — user never needs to touch Evolution API
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.basmaweb.com"
  // Append the shared secret so the inbound webhook can reject forged requests
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET
  const webhookUrl = secret
    ? `${appUrl}/api/evolution/webhook?key=${encodeURIComponent(secret)}`
    : `${appUrl}/api/evolution/webhook`
  try {
    await setInstanceWebhook(
      instance_name,
      webhookUrl,
      WEBHOOK_EVENTS
    )
  } catch (e) {
    console.error("[basma] Failed to set webhook:", e)
    // Continue even if webhook setup fails — global webhook will handle it
  }

  // 3. Save in Supabase
  const { data, error } = await supabase
    .from("instances")
    .insert({
      user_id: user.id,
      instance_name,
      display_name,
      status: "CONNECTING",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Confirm to the user that the number was added (Telegram + in-app)
  await notifyUser(user.id, "تمت إضافة رقم جديد", `تمت إضافة الرقم "${display_name}" بنجاح. امسح رمز QR من واتساب لإكمال الربط.`, "\ud83d\udcf1")

  return NextResponse.json(data)
}

// DELETE /api/instances?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { data: inst } = await supabase
    .from("instances")
    .select("instance_name, display_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try { await deleteInstance(inst.instance_name) } catch {}

  await supabase.from("instances").delete().eq("id", id)

  // Confirm the deletion to the user
  await notifyUser(user.id, "تم حذف الرقم", `تم حذف الرقم "${inst.display_name || ""}" من حسابك بنجاح.`, "\ud83d\uddd1\ufe0f")

  return NextResponse.json({ ok: true })
}
