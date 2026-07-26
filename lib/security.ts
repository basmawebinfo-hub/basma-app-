import { URL } from "url"

/**
 * Validates whether a given URL is safe for server-side fetching.
 * Blocks loopback, private IP ranges, link-local, and metadata endpoints (SSRF protection).
 */
export function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString)
    const hostname = parsed.hostname.toLowerCase()

    // Require HTTP or HTTPS protocol
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false
    }

    // Block explicit loopback, link-local, or metadata endpoint
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname === "169.254.169.254"
    ) {
      return false
    }

    // Block private IP ranges (IPv4)
    // - 10.0.0.0/8
    // - 172.16.0.0/12
    // - 192.168.0.0/16
    if (
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      (hostname.startsWith("172.") && (() => {
        const parts = hostname.split(".")
        if (parts.length < 2) return false
        const secondOctet = Number(parts[1])
        return Number.isFinite(secondOctet) && secondOctet >= 16 && secondOctet <= 31
      })())
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}
