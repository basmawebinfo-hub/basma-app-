"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Lock, Eye, Code, AlertCircle, Shield, CheckCircle } from "lucide-react"

export function TrustSection() {
  const shouldReduceMotion = useReducedMotion()

  const features = [
    {
      icon: Lock,
      title: "Data Protection",
      description: "TLS 1.3+ encryption in transit. AES-256 encryption at rest. Your data is encrypted by default."
    },
    {
      icon: Shield,
      title: "Authentication & Access",
      description: "OAuth 2.0 flows. API key management. HMAC-SHA256 signed webhooks. Multi-factor authentication ready."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We're transparent about infrastructure, security measures, and limitations. No hidden certifications."
    },
    {
      icon: Code,
      title: "Modern Infrastructure",
      description: "Built on Vercel for reliability. Neon PostgreSQL for data integrity. Automatic backups and disaster recovery."
    },
    {
      icon: AlertCircle,
      title: "Responsible Disclosure",
      description: "Security vulnerability? Contact security@basmaweb.com. We take security seriously and respond promptly."
    },
    {
      icon: CheckCircle,
      title: "Privacy First",
      description: "GDPR compliant. CCPA compliant. We don't sell your data. Your data belongs to you."
    }
  ]

  return (
    <section className="py-24 lg:py-32 border-t border-border bg-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-display mb-4 text-foreground">
            Security & Privacy First
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade security. Privacy-conscious development. Transparent about our limitations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 lg:p-8 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-6 lg:p-8 rounded-xl border border-primary/20 bg-primary/5"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Note on Certifications:</strong> We don't claim certifications we don't have. We're working toward SOC 2 compliance. For enterprise deployments, contact <a href="mailto:legal@basmaweb.com" className="text-primary hover:underline">legal@basmaweb.com</a> to discuss your security requirements.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
