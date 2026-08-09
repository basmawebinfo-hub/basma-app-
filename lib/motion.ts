// Shared motion tokens — one easing set, one duration scale (T-B.4).
// Every framer-motion transition on the marketing surface uses these.
// Ease: confident deceleration, no bounce/elastic anywhere.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

export const DURATION = {
  /** immediate feedback (hover, press) */
  fast: 0.15,
  /** routine state change */
  normal: 0.25,
  /** entrance of a section element */
  entrance: 0.4,
  /** the one authored focal entrance (hero) */
  focal: 0.6,
} as const

/** Subtle entrance: 12px rise, fast enough to never delay reading. */
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
} as const

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
} as const

/**
 * whileInView must fire exactly once — re-hiding content when it leaves the
 * viewport makes sections blank during scroll stitching, printing, and
 * no-JS-ish states. Content stays visible after its first reveal.
 */
export const viewportOnce = { once: true, margin: "0px 0px -80px 0px" } as const

/** Transition factory honouring the shared tokens. */
export function entranceTransition(delay = 0, focal = false) {
  return {
    duration: focal ? DURATION.focal : DURATION.entrance,
    delay,
    ease: EASE_OUT,
  } as const
}
