/**
 * Single source of truth for how customers reach BASMA.
 *
 * The number lives HERE and nowhere else. Never paste it into JSX, never
 * duplicate it in a second file — changing it must be a one-line edit.
 *
 * BASMA has no social accounts yet. `basmaweb.ai` is the WhatsApp identity,
 * not a separate handle, so there are deliberately no Instagram/X/TikTok
 * entries below. Add them only when real accounts exist.
 */

export const CONTACT = {
  /** International format, digits only — required by wa.me. */
  whatsapp: "201281926228",
  /** Human-readable form for display. */
  whatsappDisplay: "+20 128 192 6228",
} as const

/**
 * Build a WhatsApp deep link with a prefilled message.
 *
 * Pass a different message from each entry point (services index, service page,
 * footer) so an incoming enquiry identifies where the lead came from before the
 * conversation even starts.
 */
export function whatsappLink(message: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
}
