"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ApiPlan { id: string; name: string; price_monthly: number; max_instances: number; max_messages_mo: number }

export function Pricing() {
  const shouldReduceMotion = useReducedMotion()
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [rate, setRate] = useState(50)

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => { setPlans(d.plans ?? []); setRate(d.usd_to_egp ?? 50) })
      .catch(() => {})
  }, [])

  // Build display cards from real plans (skip the custom plan; it has its own CTA)
  const regular = plans.filter((p) => p.name !== "مخصص" && p.name.toLowerCase() !== "custom")
  const customPlan = plans.find((p) => p.name === "مخصص" || p.name.toLowerCase() === "custom")

  const display = regular.map((p, i, arr) => {
    const isFree = p.price_monthly === 0
    const featured = arr.length > 2 ? i === 2 : i === arr.length - 1
    const features = [
      `${p.max_instances} WhatsApp number${p.max_instances > 1 ? "s" : ""}`,
      p.max_messages_mo === 0 ? "Unlimited messages" : `${p.max_messages_mo} messages`,
      "Webhooks & automation API",
      "Full analytics",
      "Inbox",
    ]
    if (featured) { features.push("Priority support"); features.push("HMAC signing") }
    return {
      id: p.id,
      name: p.name,
      price: isFree ? "Free" : `$${p.price_monthly}`,
      period: isFree ? "" : "/mo",
      egp: isFree ? "" : `~ ${Math.round(p.price_monthly * rate)} EGP/mo`,
      description: isFree ? "Try the platform" : `${p.max_instances} connections`,
      features,
      cta: isFree ? "Start Free Trial" : "Choose Plan",
      featured: !!featured,
      isCustom: false,
    }
  })

  if (customPlan) {
    display.push({
      id: customPlan.id,
      name: "Custom",
      price: "Custom",
      period: "",
      egp: "",
      description: "For more than 25 numbers",
      features: ["Unlimited numbers", "Unlimited messages", "Priority support", "Dedicated onboarding", "Custom pricing"],
      cta: "Contact Us",
      featured: false,
      isCustom: true,
    })
  }

  return (
    <section id="pricing" className="relative py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-display mb-4">
            <span className="text-gradient-lime">Simple</span> pricing
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">No hidden fees. Cancel anytime. Start for free. Prices in USD (paid in EGP at today's rate).</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4">
          {display.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-5 rounded-2xl border transition-all ${plan.featured ? "bg-card border-2 border-primary ring-2 ring-primary/20 shadow-lg" : "bg-card/50 border border-border"}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                  <span className="px-3 py-1 text-[11px] font-semibold bg-primary text-primary-foreground rounded-full shadow">Most Popular</span>
                </div>
              )}

              <div className="mb-4 mt-1">
                <h3 className="text-base font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">{plan.period}</span>
                </div>
                {plan.egp && <p className="text-[11px] text-muted-foreground mb-1">{plan.egp}</p>}
                <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors ${plan.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  )
}
