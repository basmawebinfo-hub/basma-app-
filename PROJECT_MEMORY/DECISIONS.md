# Architecture Decisions Record (ADR)

## ADR 1: Enforce Mandatory Signature Verification on Webhooks
* **Context**: Webhooks without signature verification could allow attackers to send fake payload events.
* **Decision**: We made `x-evolution-signature` header strict on `api/wh/[token]`. If the signature is not present, we deny access rather than falling open.
* **Impact**: Blocks unauthorized message injections, enhancing database integrity and system security.

---

## ADR 2: Safe URL Check for SSRF Prevention
* **Context**: Users can supply arbitrary URLs for webhook destinations. If unvalidated, these make the server susceptible to SSRF attacks.
* **Decision**: Integrated a robust utility `isSafeUrl` that parses URL, validates protocol, and blocks explicit loopbacks, cloud metadata (169.254.169.254), and private subnets (RFC 1918).
* **Impact**: Protects internal infrastructure from exposure via malicious user-configured webhook destinations.

---

## ADR 3: Correct Typings Over TS Ignore Comments
* **Context**: Next.js 16 + React 19 introduced strict typings on relations and page props, leading to compiler issues in `/api/admin/stats` and `components/navbar.tsx`.
* **Decision**: Rather than using `// @ts-ignore`, we resolved compiler warnings by casting Postgrest types appropriately and correcting the key/prop labels in components.
* **Impact**: Ensures standard production compilation and guarantees that future Next.js deployments build with no warning flags.
