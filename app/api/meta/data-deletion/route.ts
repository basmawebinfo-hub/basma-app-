import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Helper function to decode and verify Facebook Signed Request
function parseSignedRequest(signedRequest: string, secret: string) {
  try {
    const parts = signedRequest.split(".")
    if (parts.length !== 2) return null
    const [encodedSig, payload] = parts

    // base64url decode signature and data payload
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    )

    // Verify cryptographic signature matches the expectation
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(payload)
    const expectedSig = hmac.digest()

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      return null
    }

    return data
  } catch {
    return null
  }
}

/**
 * POST /api/meta/data-deletion — Meta Signed Data Deletion Callback.
 * Validates Meta signed requests and returns tracking details as required by Facebook policies.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const signedRequest = formData.get("signed_request") as string | null

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request parameter" }, { status: 400 })
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET
    if (!appSecret) {
      // In development or when not configured, return safe base payload
      return NextResponse.json({
        url: "https://www.basmaweb.com/data-deletion?status=pending",
        confirmation_code: "dev_sandbox_mode",
      })
    }

    const parsedData = parseSignedRequest(signedRequest, appSecret)
    if (!parsedData) {
      return NextResponse.json({ error: "Invalid signed request signature" }, { status: 400 })
    }

    const userId = parsedData.user_id as string
    const trackingId = crypto.randomUUID()

    // Here the system would execute background deletion task or queue for user metadata deletion.
    // E.g., deleting Facebook-specific user mappings from public tables.

    return NextResponse.json({
      url: `https://www.basmaweb.com/data-deletion?id=${trackingId}`,
      confirmation_code: trackingId,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
