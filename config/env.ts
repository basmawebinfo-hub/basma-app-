/**
 * Typed environment variables — single source of truth.
 *
 * Why this file exists:
 * - Prevents "process.env.X" sprinkled everywhere with no type safety.
 * - Fails LOUDLY in dev when required env vars are missing.
 * - Fails GRACEFULLY in production (preview deployments without secrets stay alive).
 *
 * Rules:
 * - Server-only secrets MUST never be imported from client components.
 *   The `server` export below should only be touched in:
 *     - Route handlers (app/api/**)
 *     - Server actions ("use server")
 *     - Server components (no "use client")
 *   Importing it from a "use client" file will silently leak `undefined` to the browser.
 * - Public values (NEXT_PUBLIC_*) live under `client` and are safe everywhere.
 */

import { z } from "zod"

// ----- Schemas -------------------------------------------------------------

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("https://www.basmaweb.com"),
})

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  EVOLUTION_API_URL: z.string().optional().default(""),
  EVOLUTION_API_KEY: z.string().optional().default(""),
  EVOLUTION_WEBHOOK_SECRET: z.string().optional().default(""),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  CRON_SECRET: z.string().optional().default(""),
})

// ----- Parse ----------------------------------------------------------------
//
// We parse at module load so type narrowing applies everywhere downstream.
// `optional().default("")` keeps the parse from throwing on Vercel preview
// builds where secrets aren't wired. Use `requireEnv()` (below) when you
// actually need a value to be present.

const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
  EVOLUTION_WEBHOOK_SECRET: process.env.EVOLUTION_WEBHOOK_SECRET,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
})

// ----- Public exports -------------------------------------------------------

export const env = {
  client: publicEnv,
  server: serverEnv,
} as const

/**
 * Assert that a server-side env var is present, throwing a clear error if not.
 * Use this at the boundary where the var is actually needed (e.g. in a route
 * handler that calls Evolution) instead of failing at module load.
 *
 * @example
 *   const apiKey = requireEnv(env.server.EVOLUTION_API_KEY, "EVOLUTION_API_KEY")
 */
export function requireEnv(value: string, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Convenience boolean for code paths that should only run when Supabase is
 * configured. Mirrors the check in `lib/supabase/proxy.ts`.
 */
export const isSupabaseConfigured =
  publicEnv.NEXT_PUBLIC_SUPABASE_URL.startsWith("http://") ||
  publicEnv.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")
