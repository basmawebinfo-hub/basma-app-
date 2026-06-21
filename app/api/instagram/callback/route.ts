import { NextRequest, NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// GET /api/instagram/callback?code=...&state=<userId>
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state") // user id
  const errorParam = req.nextUrl.searchParams.get("error")

  const base = "https://www.basmaweb.com/dashboard/connect"
  if (errorParam || !code || !state) {
    return NextResponse.redirect(base + "?ig=error")
  }

  const appId = process.env.INSTAGRAM_APP_ID ?? ""
  const appSecret = process.env.INSTAGRAM_APP_SECRET ?? ""
  const redirectUri = "https://www.basmaweb.com/api/instagram/callback"

  try {
    // 1) Exchange code for a short-lived access token
    const form = new URLSearchParams()
    form.set("client_id", appId)
    form.set("client_secret", appSecret)
    form.set("grant_type", "authorization_code")
    form.set("redirect_uri", redirectUri)
    form.set("code", code)

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(base + "?ig=token_error")
    }

    const shortToken = tokenData.access_token as string
    const igUserId = String(tokenData.user_id ?? "")

    // 2) Exchange for a long-lived token (60 days)
    const longRes = await fetch(
      "https://graph.instagram.com/access_token?grant_type=ig_exchange_token" +
      "&client_secret=" + encodeURIComponent(appSecret) +
      "&access_token=" + encodeURIComponent(shortToken)
    )
    const longData = await longRes.json()
    const accessToken = (longData.access_token as string) ?? shortToken
    const expiresIn = Number(longData.expires_in ?? 0)
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

    // 3) Fetch the IG username
    let username: string | null = null
    try {
      const meRes = await fetch("https://graph.instagram.com/me?fields=user_id,username&access_token=" + encodeURIComponent(accessToken))
      const me = await meRes.json()
      username = me.username ?? null
    } catch { /* ignore */ }

    // 4) Save to DB
    const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await db.from("instagram_accounts").upsert({
      user_id: state,
      ig_user_id: igUserId,
      ig_username: username,
      access_token: accessToken,
      token_expires_at: expiresAt,
      connected_at: new Date().toISOString(),
    }, { onConflict: "ig_user_id" })

    // close the popup and tell the opener it is connected
    return new NextResponse(
      "<html><body><script>if(window.opener){window.opener.postMessage('ig_connected','*');window.close();}else{window.location.href='" + base + "?ig=connected';}</script><p>Connected. You can close this window.</p></body></html>",
      { status: 200, headers: { "Content-Type": "text/html" } }
    )
  } catch {
    return new NextResponse(
      "<html><body><script>if(window.opener){window.opener.postMessage('ig_error','*');window.close();}else{window.location.href='" + base + "?ig=error';}</script><p>Error.</p></body></html>",
      { status: 200, headers: { "Content-Type": "text/html" } }
    )
  }
}
