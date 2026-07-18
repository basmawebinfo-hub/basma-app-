"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, Lock, Zap, RefreshCw, BarChart3, Shield } from "lucide-react"

export function ValueProposition() {
  const shouldReduceMotion = useReducedMotion()

  const values = [
    {
      icon: Zap,
      title: "Centralize Business Communication",
      description: "Manage all WhatsApp conversations in one unified inbox. Track, organize, and respond to customer inquiries at scale."
    },
    {
      icon: RefreshCw,
      title: "Automate Repetitive Workflows",
      description: "Eliminate manual tasks. Route messages, trigger automations, and integrate with n8n, Zapier, Make, and any API."
    },
    {
      icon: BarChart3,
      title: "Improve Operational Efficiency",
      description: "Reduce response times. Track message volume, delivery rates, and conversation metrics in real-time dashboards."
    },
    {
      icon: Lock,
      title: "Enterprise Security & Privacy",
      description: "TLS 1.3+ encryption, AES-256 at rest, HMAC-signed webhooks. Your data remains under your control."
    },
    {
      icon: CheckCircle2,
      title: "Official API Integrations",
      description: "Built on official WhatsApp APIs. No unofficial workarounds. Reliable, scalable, production-ready."
    },
    {
      icon: Shield,
      title: "Privacy-First Development",
      description: "We don't sell your data. No tracking. GDPR and CCPA compliant. Your privacy is our priority."
    }
  ]

  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-display mb-4 text-foreground">
            Why BASMA AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for businesses that demand reliability, security, and transparency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative p-6 lg:p-8">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
