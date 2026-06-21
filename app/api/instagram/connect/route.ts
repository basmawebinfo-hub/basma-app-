import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/instagram/connect  -> redirects the user to Instagram OAuth
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect("https://www.basmaweb.com/login")

  const appId = process.env.META_APP_ID ?? ""
  const redirectUri = "https://www.basmaweb.com/api/instagram/callback"
  const scope = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
  ].join(",")

  // state = user id (to link the account back to this user)
  const state = user.id
  const authUrl =
    "https://www.instagram.com/oauth/authorize" +
    "?client_id=" + encodeURIComponent(appId) +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&response_type=code" +
    "&scope=" + encodeURIComponent(scope) +
    "&state=" + encodeURIComponent(state)

  return NextResponse.redirect(authUrl)
}
