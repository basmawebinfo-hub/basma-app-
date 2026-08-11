"use client"

import { egp, usd } from "@/config/pricing"
import { whatsappLink } from "@/config/contact"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import type { PricedItem } from "@/lib/catalog"
import { useI18n } from "@/lib/i18n"

/**
 * One catalogue item, with the full price breakdown.
 *
 * The breakdown is not decoration. A customer who knows Claude costs $20 and
 * sees $29 reads a 45% markup and leaves. The same customer, shown that $2.80
 * of it is government VAT, reads a $5 service fee. Same total, opposite
 * reaction — and every line of it is true.
 *
 * The VAT row is hidden when the provider doesn't charge it, rather than shown
 * as $0.00, so the breakdown never invents a line item.
 */
export function PriceCard({ item }: { item: PricedItem }) {
  const { t } = useI18n()
  const { list, vat, fee, total, egp: egpTotal } = item.price

  const message = t("wa.msg.item").replace("{item}", item.name)

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
        <span dir="ltr" className="font-mono text-lg font-bold text-primary shrink-0">
          {usd(total)}
        </span>
      </div>

      {item.note && <p className="text-sm text-muted-foreground mb-5">{item.note}</p>}

      <dl className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{t("price.list")}</dt>
          <dd dir="ltr" className="font-mono text-foreground/80">{usd(list)}</dd>
        </div>

        {vat > 0 && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("price.vat")}</dt>
            <dd dir="ltr" className="font-mono text-foreground/80">{usd(vat)}</dd>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{t("price.fee")}</dt>
          <dd dir="ltr" className="font-mono text-foreground/80">{usd(fee)}</dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 mt-3">
          <dt className="font-medium text-foreground">{t("price.total")}</dt>
          <dd dir="ltr" className="font-mono font-bold text-primary">{usd(total)}</dd>
        </div>
      </dl>

      {/* EGP is derived from one rate constant and labelled as indicative — the
          pound moves, and promising a figure we can't hold is worse than
          showing none. */}
      <p className="mt-3 text-xs text-muted-foreground">
        ≈ <span dir="ltr" className="font-mono">{egp(egpTotal)}</span> {t("price.egp")}
      </p>

      <Button asChild variant="secondary" size="lg" className="w-full mt-5">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          {t("price.cta")}
        </a>
      </Button>
    </div>
  )
}
