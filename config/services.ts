/**
 * Service catalogue.
 *
 * Only list services that actually exist. Do not add placeholder entries to
 * fill out a grid — an honest one-service page beats a padded one.
 */

export interface ServiceSummary {
  /** URL segment under /services */
  slug: string
  /** i18n keys — copy lives in lib/i18n.tsx, not here */
  titleKey: string
  taglineKey: string
}

export const SERVICES: ServiceSummary[] = [
  {
    slug: "ai-subscriptions",
    titleKey: "svc.ai.title",
    taglineKey: "svc.ai.tagline",
  },
]

/**
 * ⚠️ PLACEHOLDERS — the owner has not supplied these numbers yet.
 *
 * `null` means "not decided". The UI MUST render a neutral, honest fallback
 * for a null value and must never invent a figure. Publishing an invented
 * price or turnaround time is a promise the business did not make.
 *
 * To go live: replace the nulls, and the fallbacks disappear automatically.
 */
export const AI_SUBSCRIPTION_TERMS = {
  /**
   * Settled 2026-08-10: 20% of the list price, with a $5 minimum. Stated here
   * in the customer's language rather than as a formula — the per-item
   * breakdown on each price card shows the actual number.
   */
  fee: "٢٠٪ من سعر الاشتراك، بحد أدنى $5",
  /**
   * ⚠️ STILL A PLACEHOLDER — the owner has not given a realistic figure.
   * `null` renders "agreed in the conversation", which is honest. Do not invent
   * "within 24 hours": that is a public promise the business hasn't made.
   */
  turnaround: null as string | null,
} as const
