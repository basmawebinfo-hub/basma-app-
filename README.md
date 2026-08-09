# BASMA — بصمة

BASMA is an Arabic-first WhatsApp automation SaaS: connect WhatsApp numbers,
run bulk campaigns, set auto-reply rules, expose a per-user REST API and
per-user webhooks, and manage billing/subscriptions from an admin dashboard.
It integrates Evolution API (WhatsApp) and a Telegram bot for notifications
and support.

This repository is linked to a [v0](https://v0.app) project.

[Continue working on v0 →](https://v0.app/chat/projects/prj_QnWSZz0s7C02PRCVbip5jTXpnlLW)

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** + shadcn/ui
- **Supabase** (Postgres + Auth + Storage)
- **Evolution API** (WhatsApp)
- **Telegram Bot API**
- Package manager: **pnpm** (not npm, not yarn)

## Prerequisites

- Node.js 20
- pnpm 10 (pinned via `packageManager` in `package.json` — `corepack enable` gives you the right one)
- A Supabase project (free tier works)
- An Evolution API instance (for WhatsApp features)

## Local setup

```bash
git clone <repo-url>
cd Basmaweb
pnpm install
cp .env.example .env.local   # then fill in your values
```

Create the database: in the Supabase Dashboard → SQL Editor, run

1. `supabase/schema.sql` — tables, constraints, indexes, signup trigger
2. `supabase/rls.sql` — row-level security policies

Then start the dev server:

```bash
pnpm dev
```

## Environment variables

See `.env.example` for placeholder values. Summary:

| Variable | Required | What it's for |
|----------|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Service-role key (server-only, bypasses RLS) |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL of the app |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | No | Auth email redirect override (local dev) |
| `EVOLUTION_API_URL` | For WhatsApp | Evolution API base URL |
| `EVOLUTION_API_KEY` | For WhatsApp | Evolution API key |
| `EVOLUTION_WEBHOOK_SECRET` | Recommended | Verify inbound Evolution webhooks |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot (notifications/support) |
| `TELEGRAM_ADMIN_CHAT_ID` | No | Chat that receives admin alerts |
| `TELEGRAM_BOT_USERNAME` | No | Builds t.me deep links |
| `CRON_SECRET` | Prod: yes | Protects `/api/cron/*` routes |
| `GROQ_API_KEY` | No | AI replies (Groq) |
| `GEMINI_API_KEY` | No | AI replies (Gemini) |
| `META_APP_SECRET` / `META_VERIFY_TOKEN` / `FACEBOOK_APP_SECRET` | No | Meta/Instagram webhooks |

In production the app refuses to boot if any required variable is missing
(`assertProductionEnv()` in `config/env.ts`, called from `app/layout.tsx`).

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint gate |
| `pnpm test` | Vitest suite (single run) |
| `pnpm typecheck` | `tsc --noEmit` |

## Architecture

| Path | What lives there |
|------|------------------|
| `app/` | App Router pages + ~70 API routes under `app/api/` |
| `app/api/` | Route handlers — most use the **service-role** key (bypasses RLS), so ownership checks in route code are critical |
| `lib/` | Shared server logic: `supabase/` clients, `admin.ts` (admin gate), `auth/` (session + guards), `security.ts` (SSRF allowlist), `rate-limit/`, `evolution.ts`, `plan.ts`, `anti-ban.ts` |
| `config/` | `env.ts` (typed env + boot validation), `tiers.ts` (plan tiers/limits), `permissions.ts` |
| `components/` | UI — `components/ui/` is shadcn-generated |
| `hooks/` | Client hooks |
| `supabase/` | `schema.sql` + `rls.sql` + `SCHEMA_NOTES.md` + incremental `migrations/` |
| `types/` | Shared TypeScript types |

## Deploy

Deployed on **Vercel**. Two cron jobs run daily (see `vercel.json`):

- `0 6 * * *` → `/api/cron/subscriptions` — expiry warnings, downgrades, low-balance alerts
- `0 7 * * *` → `/api/cron/billing` — daily plan charges from wallet balance

Both require `CRON_SECRET` to be set in the Vercel environment.
