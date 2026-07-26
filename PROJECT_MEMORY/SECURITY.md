# Security Verification & Hardening Report

This report documents the security posture of BASMA AI, verified against the actual codebase as of **2026-07-26**.

---

## 1. Webhook Signature Validation (HMAC)

### Vulnerability Identified & Fixed:
* **The Vulnerability**: In `/api/wh/[token]/route.ts`, if the `x-evolution-signature` was missing (empty string), the verification statement `if (sig && !verifyHmac(...))` skipped the cryptographic check entirely. This allowed malicious actors to inject fake events into users' databases if they knew the token.
* **The Fix**: Modified the check to make `x-evolution-signature` header **mandatory**. If the header is missing, a `401 Unauthorized` is returned immediately.
* **HMAC Verification Code**:
  ```typescript
  function verifyHmac(body: string, secret: string, signature: string): boolean {
    try {
      const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    } catch { return false }
  }
  ```
  *(Wrapped in `try/catch` to safely return `false` on buffer length mismatches, preventing timing attack runtime crashes).*

---

## 2. Server-Side Request Forgery (SSRF) Protection

### Vulnerability Identified & Fixed:
* **The Vulnerability**: Webhook config URLs submitted by users were fetched directly by the server without validation in both `deliverWebhook` and `deliverToDestination`. An attacker could specify private endpoints like `http://127.0.0.1:5432` or `http://169.254.169.254` (cloud metadata) to extract local secrets or target internal infrastructure.
* **The Fix**: Created a dedicated SSRF URL validation module `lib/security.ts` using `isSafeUrl`. Verified that:
  * Only `http:` and `https:` protocols are allowed.
  * Explicit blocklists are active for `localhost`, `127.0.0.1`, `::1`, and `169.254.169.254`.
  * Private IPv4 ranges (RFC 1918) are blocked: `10.*`, `192.168.*`, and `172.16.0.0/12`.
* **Integrated**: Added this validation directly to:
  * `/api/wh/[token]` (deliverWebhook)
  * `/api/evolution/webhook` (deliverToDestination)

---

## 3. Rate Limiting Strategy
* **Endpoints Configured**: `/api/ping`, `/api/plan-request`, `/api/pricing`, and `/api/send`.
* **limiter implementation**: In-memory sliding/fixed-window MemoryRateLimiter, fully optimized for Next.js Serverless runtime (with fail-open safety).

---

## 4. Tenant Isolation & Supabase RLS
* **Status**: **HIGHLY SECURE**
* Verified that every customer-facing table uses `auth.uid() = user_id` or verifies instance ownership via explicit subqueries. See `DATABASE.md` for a comprehensive RLS audit.
