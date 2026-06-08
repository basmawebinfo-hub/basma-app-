"use client"

import { motion, useReducedMotion } from "framer-motion"
import { QrCode, Webhook, Zap } from "lucide-react"

const steps = [
  {
    icon: QrCode,
    title: "Scan & Connect",
    description: "Open the dashboard, scan the QR code with WhatsApp, and your number is live in under 30 seconds.",
  },
  {
    icon: Webhook,
    title: "Configure Webhooks",
    description: "Choose which events to forward — messages, status updates, calls — and set your destination URLs.",
  },
  {
    icon: Zap,
    title: "Automate Everything",
    description: "Every WhatsApp event triggers your n8n, Zapier, or custom workflow automatically, in real time.",
  },
]

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="webhooks" className="relative py-24 lg:py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            How it <span className="text-gradient-lime">works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From zero to live WhatsApp webhooks in three simple steps</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
