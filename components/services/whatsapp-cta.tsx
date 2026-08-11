"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/config/contact"
import { useI18n } from "@/lib/i18n"

/**
 * The one way customers start a conversation. There is no backend and no form
 * handler — this opens WhatsApp with a prefilled message.
 *
 * `messageKey` differs per entry point so an incoming enquiry identifies where
 * the lead came from before the conversation starts.
 */
export function WhatsAppCta({
  messageKey,
  labelKey = "svc.ai.cta",
  variant = "default",
  size = "lg",
  className,
}: {
  messageKey: string
  labelKey?: string
  variant?: "default" | "secondary" | "outline"
  size?: "default" | "lg" | "xl"
  className?: string
}) {
  const { t } = useI18n()

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={whatsappLink(t(messageKey))} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="w-4 h-4" />
        {t(labelKey)}
      </a>
    </Button>
  )
}
