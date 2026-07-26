import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

/**
 * POST /api/user/delete — Secure account deletion endpoint.
 * Requires user authentication.
 * Deletes user profiles, instances, campaigns, and finally the Auth User (via admin client).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize service client with role key to perform auth user deletion
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Server configuration missing: service role client cannot be initialized" },
        { status: 500 }
      )
    }

    const adminClient = createServiceClient(supabaseUrl, serviceRoleKey)

    // Delete user from auth.users (cascades to public.profiles, public.instances, etc.)
    const { error } = await adminClient.auth.admin.deleteUser(user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Force sign-out session
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true, message: "Account successfully deleted" })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
