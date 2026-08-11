import type { Metadata } from "next"
import { AiSubscriptionsPage } from "./service-page"

const URL = "https://www.basmaweb.com/services/ai-subscriptions"

export const metadata: Metadata = {
  title: "اشتراكات الذكاء الاصطناعي والكورسات",
  description:
    "عايز تشترك في أداة ذكاء اصطناعي أو كورس أونلاين ومعندكش كارت بيشتغل بره مصر؟ بصمة بتدفعلك الاشتراك على حسابك إنت — وإنت بتدفع محليًا بفودافون كاش أو تحويل بنكي.",
  alternates: { canonical: URL },
  openGraph: {
    title: "اشتراكات الذكاء الاصطناعي والكورسات | بصمة",
    description:
      "بندفعلك اشتراكك على حسابك إنت، وإنت بتدفع محليًا بالجنيه المصري.",
    url: URL,
  },
}

/**
 * `Service` JSON-LD. Deliberately describes this as paying on the customer's
 * behalf — not reselling accounts — matching the on-page copy. Structured data
 * that overstates the offering is as much of a liability as body copy that does.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "اشتراكات الذكاء الاصطناعي والكورسات",
  serviceType: "Subscription payment assistance",
  description:
    "دفع اشتراكات أدوات الذكاء الاصطناعي والكورسات الأونلاين نيابةً عن العميل على حسابه الخاص، مقابل دفع محلي بالجنيه المصري.",
  provider: {
    "@type": "Organization",
    name: "BASMA بصمة",
    url: "https://www.basmaweb.com",
  },
  areaServed: { "@type": "Country", name: "Egypt" },
  url: URL,
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AiSubscriptionsPage />
    </>
  )
}
