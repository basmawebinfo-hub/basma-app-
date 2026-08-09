"use client"

import { motion, useReducedMotion } from "framer-motion"

const logos = [
  { name: "n8n", text: "n8n" },
  { name: "Zapier", text: "Zapier" },
  { name: "Make", text: "Make" },
  { name: "HubSpot", text: "HubSpot" },
  { name: "Airtable", text: "Airtable" },
  { name: "Notion", text: "Notion" },
  { name: "Slack", text: "Slack" },
]

export function LogoCloud() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="section-strip" aria-label="Featured in">
      <div className="container-site max-w-6xl">
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Integrates with the tools you already use
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="text-lg font-semibold tracking-tight">{logo.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
