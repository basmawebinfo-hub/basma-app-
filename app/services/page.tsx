import type { Metadata } from "next"
import { ServicesIndex } from "./services-index"

export const metadata: Metadata = {
  title: "الخدمات",
  description:
    "خدمات بصمة — نساعدك تشترك في أدوات الذكاء الاصطناعي والكورسات الأونلاين حتى لو معندكش كارت بيشتغل دوليًا. الدفع محليًا بالجنيه المصري.",
  alternates: { canonical: "https://www.basmaweb.com/services" },
  openGraph: {
    title: "خدمات بصمة",
    description:
      "نساعدك تشترك في أدوات الذكاء الاصطناعي والكورسات الأونلاين — الدفع محليًا بالجنيه المصري.",
    url: "https://www.basmaweb.com/services",
  },
}

export default function ServicesPage() {
  return <ServicesIndex />
}
