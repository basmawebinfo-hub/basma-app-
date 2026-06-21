/**
 * Anti-Ban protection layer for WhatsApp (Evolution/Baileys).
 * WhatsApp aggressively bans accounts that behave like bots. These helpers
 * make outgoing traffic look human: randomized delays, typing presence,
 * message spinning, account warmup limits, and quiet hours.
 */

// ── 1. Randomized human-like delay ────────────────────────────────────────────
// Instead of a fixed gap, wait a random time within a range (ms).
export function humanDelay(minSec = 4, maxSec = 12): number {
  return Math.floor((minSec + Math.random() * (maxSec - minSec)) * 1000)
}

// Typing duration scaled to message length (longer text = longer "typing").
export function typingDuration(text: string): number {
  const base = 1000
  const perChar = 35 // ms per character, like a real typist
  return Math.min(base + text.length * perChar, 8000) // cap at 8s
}

// ── 2. Message spinning (avoid identical messages) ────────────────────────────
// Turns "Hello {Hi|Hey|Hello} there" into one random variant per send.
// Also supports {{name}} / {{phone}} placeholders.
export function spinMessage(template: string, vars: Record<string, string> = {}): string {
  // resolve {a|b|c} spintax
  let out = template.replace(/\{([^{}|]+(\|[^{}|]+)+)\}/g, (_m, group: string) => {
    const opts = group.split("|")
    return opts[Math.floor(Math.random() * opts.length)]
  })
  // resolve variables
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v ?? "")
  }
  return out.trim()
}

// ── 3. Account warmup ─────────────────────────────────────────────────────────
// New numbers should send little at first, ramping up over ~2 weeks.
// Returns the max messages allowed today based on account age (days).
export function warmupDailyLimit(accountAgeDays: number): number {
  if (accountAgeDays < 1) return 20
  if (accountAgeDays < 3) return 50
  if (accountAgeDays < 7) return 150
  if (accountAgeDays < 14) return 400
  if (accountAgeDays < 30) return 800
  return 2000 // mature account ceiling for safety
}

// ── 4. Quiet hours ────────────────────────────────────────────────────────────
// Humans don't blast messages at 3 AM. Block sending during quiet hours.
// hours in 24h local time. Default: 23:00 → 07:00.
export function isQuietHour(date = new Date(), startHour = 23, endHour = 7): boolean {
  const h = date.getHours()
  if (startHour < endHour) return h >= startHour && h < endHour
  return h >= startHour || h < endHour // wraps midnight
}

// ── 5. Per-minute rate guard ──────────────────────────────────────────────────
// Simple in-memory token check (best-effort within a single run).
export function maxPerMinute(accountAgeDays: number): number {
  if (accountAgeDays < 3) return 3
  if (accountAgeDays < 14) return 8
  return 15
}

// ── 6. Batch pacing ───────────────────────────────────────────────────────────
// After every N messages, take a longer "coffee break".
export function shouldTakeBreak(sentCount: number, batchSize = 25): boolean {
  return sentCount > 0 && sentCount % batchSize === 0
}
export function breakDuration(): number {
  return Math.floor((60 + Math.random() * 120) * 1000) // 1–3 min
}

// ── 7. Sleep helper ───────────────────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
