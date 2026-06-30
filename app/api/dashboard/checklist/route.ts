import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Returns the user's onboarding checklist state.
 *
 * For Phase 1 (Milestone B) we only verify the steps we can derive from
 * the DB right now:
 *   - profile.full_name filled → "complete-profile"
 *   - any instance with status=CONNECTED → "connect-whatsapp"
 *
 * The other steps (intro video, lab demo, first course) are tracked
 * client-side via localStorage until Academy / Lab impl land in
 * Phase 2/3 and we get a real `user_onboarding` table. The frontend
 * merges this server state with its localStorage state.
 *
 * Source: DASHBOARD_INFORMATION_ARCHITECTURE.md §5.1 (Smart Checklist)
 */

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Pull profile completeness + connected instance count in parallel.
  const [profileRes, instanceRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("instances")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "CONNECTED"),
  ])

  const profileComplete = Boolean(profileRes.data?.full_name?.trim())
  const hasConnectedInstance = (instanceRes.count ?? 0) > 0

  return NextResponse.json({
    serverSteps: {
      "complete-profile": profileComplete,
      "connect-whatsapp": hasConnectedInstance,
    },
  })
}
