"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Users, Lightbulb, AlertCircle } from "lucide-react"

export function TransparencySection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-24 lg:py-32 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-display mb-4 text-foreground">
            About AI & Human Oversight
          </h2>
          <p className="text-lg text-muted-foreground">
            We're transparent about how we use AI and where human judgment matters.
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary/5 rounded-xl p-8 border border-primary/20"
          >
            <div className="flex gap-4 mb-4">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  AI Assists, Humans Decide
                </h3>
                <p className="text-muted-foreground">
                  BASMA AI uses AI to suggest automations, analyze message patterns, and recommend workflows. However, <strong>you remain responsible</strong> for configuring automation rules, approving message content, and managing customer interactions. AI outputs should be reviewed before deployment in production.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-background rounded-xl p-8 border border-border"
          >
            <div className="flex gap-4 mb-4">
              <Users className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  We Don't Train on Your Data
                </h3>
                <p className="text-muted-foreground">
                  Your messages, customer data, and business information are never used to train AI models. Your data remains private and is only used to serve your automation needs.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-background rounded-xl p-8 border border-border"
          >
            <div className="flex gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Know Your Tools & Test First
                </h3>
                <p className="text-muted-foreground">
                  AI recommendations are suggestions, not guarantees. Always test automation rules in a non-production environment. Verify AI-generated outputs before they reach customers. You are responsible for compliance with WhatsApp's policies and local regulations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 p-6 rounded-lg bg-muted text-center"
        >
          <p className="text-sm text-muted-foreground">
            Questions about AI usage? See our <a href="/ai-transparency" className="text-primary hover:underline font-medium">AI Transparency Policy</a>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
