# BASMA AI — Project Architecture Map

This document outlines the end-to-end flow of BASMA AI, tracing user requests, authentication, proxy/middleware, database operations, and external services.

```
       [ User / Client Browser ]
                   │
                   ▼ (Next.js Request)
         [ Next.js Middleware ] ──► (Auth Check, Suspended check, Telegram check)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    [ Dashboard ]        [ API Route ]
  (Server Components/  (/api/send, /api/wh, etc.)
    Server Actions)          │
         │                   │
         ▼                   ▼
┌─────────────────────────────────┐
│       Supabase SSR Client       │
│  (Interacts with DB under RLS)   │
└─────────────────────────────────┘
                 │
                 ▼ (Database Actions)
        ┌──────────────────┐
        │   PostgreSQL     │
        │ (Supabase Host)  │
        └──────────────────┘
                 ▲
                 │ (Updates / Reads)
┌─────────────────────────────────┐
│     Evolution API Webhooks      │
│     (MESSAGES_UPSERT, etc.)     │
└─────────────────────────────────┘
                 ▲
                 │ (Inbound / Outbound API calls)
         [ Evolution API ]
                 ▲
                 │ (Signal protocols)
         [ WhatsApp Web ]
```

---

## Trust Boundaries & Security Enclaves

### 1. User Client / Dashboard
* **Trust Level**: Low (untrusted client-side input).
* **Security Controls**:
  * Next.js Middleware verifies Supabase authentication session.
  * Suspended, Pending, or Admin-bounced users are redirected to their respective routes (`/suspended`, `/pending`, `/admin`).
  * API routes and Server Actions fetch current user via `supabase.auth.getUser()`, which does a secure cryptographic verification of the JWT.

### 2. Next.js API Routes (`/api/...`)
* **Trust Level**: Medium/High (secure server-side execution context).
* **Enforced Controls**:
  * **Public Endpoints** (e.g. `/api/send`): Require a valid, hashed API key (`bsm_live_...`) and are rate-limited via `MemoryRateLimiter` to prevent database abuse or resource exhaustion.
  * **Evolution Incoming Webhook** (`/api/wh/[token]`): Authenticates inbound events using the unique random webhook `token` and validates cryptographically via an `x-evolution-signature` SHA-256 HMAC header.
  * **Evolution General Webhook** (`/api/evolution/webhook`): Protected via a shared secret string (`EVOLUTION_WEBHOOK_SECRET`) passed via header/URL.

### 3. Supabase / PostgreSQL Database
* **Trust Level**: Maximum (ultimate source of truth).
* **Enforced Controls**:
  * **Row Level Security (RLS)**: Active on all public schema tables. Users can only select/insert/update/delete records belonging directly to their own account or linked WhatsApp instance.
  * **Service Role Client (`supabase-service-role`)**: Used only in system-enforced background workers, cron handlers, or webhook receivers (e.g., storing incoming message events, updating instance connection statuses) where user-level context is unavailable.
