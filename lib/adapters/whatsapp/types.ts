/**
 * WhatsApp provider adapter interface.
 *
 * A WhatsApp provider connects a business account to WhatsApp and exposes
 * the operations Basma needs to send messages and manage sessions. This
 * interface is intentionally generic across providers:
 *
 *   - Evolution API (unofficial multi-device, self-hosted)
 *   - Meta WhatsApp Cloud API (official)
 *   - Twilio WhatsApp
 *   - any future provider that speaks WhatsApp semantics
 *
 * None of the methods below reveal provider-specific details. If a caller
 * needs to know which provider is active, that's a Service Registry
 * concern, not an interface concern.
 */

export type SessionId = string
export type MessageId = string

export interface IWhatsAppProvider {
  /**
   * Send a plain-text WhatsApp message from the given session to the given
   * recipient. `to` is an E.164 phone number without the leading '+'.
   * Returns the provider's message id.
   */
  sendText(sessionId: SessionId, to: string, text: string): Promise<MessageId>

  /**
   * Send a media message (image, document, audio, video) by URL. The URL
   * must be reachable by the provider. Provider decides caching / staging.
   */
  sendMedia(sessionId: SessionId, to: string, mediaUrl: string): Promise<MessageId>

  /**
   * Disconnect a session (log out the WhatsApp account on the provider side).
   * Idempotent — calling twice on an already-disconnected session must not throw.
   */
  disconnectSession(sessionId: SessionId): Promise<void>
}
