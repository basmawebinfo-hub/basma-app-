"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Star } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion()
  const { t } = useI18n()

  const testimonials = [
    { quoteKey: "test.q1", author: "Sarah Chen", roleKey: "test.r1", avatar: "/professional-woman-headshot.png" },
    { quoteKey: "test.q2", author: "Marcus Williams", roleKey: "test.r2", avatar: "/professional-man-headshot.png" },
    { quoteKey: "test.q3", author: "Emily Rodriguez", roleKey: "test.r3", avatar: "/professional-woman-executive-headshot.png" },
  ]

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-display mb-4">
            {t("test.title1")} <span className="text-gradient-lime">{t("test.title2")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t("test.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 sm:p-6 rounded-xl border border-border bg-card/50 text-start"
            >
              <div className="flex gap-1 mb-3 sm:mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 leading-relaxed">
                {t(testimonial.quoteKey)}
              </blockquote>
              <div className="flex items-center gap-3">
                <img src={testimonial.avatar} alt="" aria-hidden="true" className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover bg-muted" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t(testimonial.roleKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
