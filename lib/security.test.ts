import { describe, it, expect } from "vitest"
import { isSafeUrl } from "./security"
import crypto from "crypto"

// Helper function to create a Meta signed request for testing
function createMetaSignedRequest(payload: object, secret: string): string {
  const payloadStr = JSON.stringify(payload)
  const encodedPayload = Buffer.from(payloadStr).toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(encodedPayload)
  const signature = hmac.digest()

  const encodedSignature = signature.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return `${encodedSignature}.${encodedPayload}`
}

// Function to decode Facebook Signed Request (mirrors implementation in API route)
function parseSignedRequestForTest(signedRequest: string, secret: string) {
  try {
    const parts = signedRequest.split(".")
    if (parts.length !== 2) return null
    const [encodedSig, payload] = parts

    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    )

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

describe("Security - SSRF Prevention (isSafeUrl)", () => {
  it("allows safe public URLs", () => {
    expect(isSafeUrl("https://www.google.com")).toBe(true)
    expect(isSafeUrl("http://basmaweb.com/test")).toBe(true)
  })

  it("blocks non-HTTP/HTTPS protocols", () => {
    expect(isSafeUrl("ftp://ftp.example.com")).toBe(false)
    expect(isSafeUrl("file:///etc/passwd")).toBe(false)
    expect(isSafeUrl("gopher://gopher.example.com")).toBe(false)
  })

  it("blocks loopback and localhosts", () => {
    expect(isSafeUrl("http://localhost")).toBe(false)
    expect(isSafeUrl("http://127.0.0.1")).toBe(false)
    expect(isSafeUrl("http://[::1]")).toBe(false)
  })

  it("blocks cloud metadata endpoint", () => {
    expect(isSafeUrl("http://169.254.169.254/latest/meta-data")).toBe(false)
  })

  it("blocks RFC 1918 private IPv4 subnets", () => {
    // 10.0.0.0/8
    expect(isSafeUrl("http://10.0.0.1")).toBe(false)
    expect(isSafeUrl("https://10.255.255.255/admin")).toBe(false)

    // 192.168.0.0/16
    expect(isSafeUrl("http://192.168.1.1")).toBe(false)
    expect(isSafeUrl("https://192.168.255.254")).toBe(false)

    // 172.16.0.0/12
    expect(isSafeUrl("http://172.16.0.1")).toBe(false)
    expect(isSafeUrl("http://172.31.255.255")).toBe(false)

    // But allows 172.32.0.1 (not in 16-31 range)
    expect(isSafeUrl("http://172.32.0.1")).toBe(true)
  })
})

describe("Security - Meta Signed Request Verification", () => {
  const secret = "test_facebook_app_secret"

  it("successfully decodes and cryptographically verifies valid signatures", () => {
    const payload = { user_id: "123456789", algorithm: "HMAC-SHA256" }
    const signedRequest = createMetaSignedRequest(payload, secret)

    const decoded = parseSignedRequestForTest(signedRequest, secret)
    expect(decoded).not.toBeNull()
    expect(decoded.user_id).toBe("123456789")
  })

  it("rejects invalid signature payloads", () => {
    const payload = { user_id: "123456789", algorithm: "HMAC-SHA256" }
    const signedRequest = createMetaSignedRequest(payload, secret)

    // Tamper with the payload block
    const tampered = signedRequest + "extra_noise"
    const decoded = parseSignedRequestForTest(tampered, secret)
    expect(decoded).toBeNull()
  })

  it("rejects signatures signed with the wrong app secret", () => {
    const payload = { user_id: "123456789", algorithm: "HMAC-SHA256" }
    const signedRequest = createMetaSignedRequest(payload, "wrong_secret")

    const decoded = parseSignedRequestForTest(signedRequest, secret)
    expect(decoded).toBeNull()
  })
})
