"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Command, CornerDownLeft } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"

const examplePrompts = [
  "What is the price?",
  "When is my order ready?",
  "Do you offer delivery?",
  "Is this product available?",
  "How do I track my shipment?",
]

const trustedLogos = [
  { name: "n8n", text: "n8n" },
  { name: "Zapier", text: "Zapier" },
  { name: "Make", text: "Make" },
  { name: "Notion", text: "Notion" },
  { name: "Airtable", text: "Airtable" },
]

export function Hero() {
  const { t } = useI18n()
  const shouldReduceMotion = useReducedMotion()
  const [prompt, setPrompt] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const [displayText, setDisplayText] = useState("")
  const [promptIndex, setPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    // Don't animate if user is typing or input is focused
    if (prompt || isFocused || shouldReduceMotion) {
      setDisplayText("")
      return
    }

    const currentPrompt = examplePrompts[promptIndex]
    let charIndex = 0
    let timeout: NodeJS.Timeout

    if (isTyping) {
      // Typing forward
      timeout = setInterval(() => {
        if (charIndex <= currentPrompt.length) {
          setDisplayText(currentPrompt.slice(0, charIndex))
          charIndex++
        } else {
          clearInterval(timeout)
          // Pause at end before deleting
          setTimeout(() => setIsTyping(false), 2000)
        }
      }, 50)
    } else {
      // Deleting
      charIndex = currentPrompt.length
      timeout = setInterval(() => {
        if (charIndex >= 0) {
          setDisplayText(currentPrompt.slice(0, charIndex))
          charIndex--
        } else {
          clearInterval(timeout)
          // Move to next prompt
          setPromptIndex((prev) => (prev + 1) % examplePrompts.length)
          setIsTyping(true)
        }
      }, 30)
    }

    return () => clearInterval(timeout)
  }, [promptIndex, isTyping, prompt, isFocused, shouldReduceMotion])

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center pt-28 lg:pt-32 pb-40 sm:pb-32">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("hero.badge")}
          </motion.div>

          <motion.h1
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-display text-balance mb-6 leading-[1.1]"
          >
            <span className="text-gradient-lime">{t("hero.title1")}</span>
            <br />
            <span className="text-foreground">{t("hero.title2")}</span>
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty leading-relaxed px-2"
          >
            {t("hero.desc")}
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative bg-card border border-border rounded-xl overflow-hidden shadow-[0_0_30px_rgba(206,255,0,0.15),0_0_60px_rgba(206,255,0,0.08)]">
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder=""
                  className="w-full bg-transparent px-4 sm:px-5 py-3 sm:py-4 pr-20 sm:pr-28 text-foreground focus:outline-none text-sm sm:text-base"
                />
                {/* Animated placeholder */}
                {!prompt && !isFocused && (
                  <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none text-sm sm:text-base text-muted-foreground truncate max-w-[60%] sm:max-w-none">
                    {displayText}
                    <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
                  </div>
                )}
                {!prompt && isFocused && (
                  <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none text-sm sm:text-base text-muted-foreground/50">
                    Simulate a WhatsApp message...
                  </div>
                )}
              </div>
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 text-muted-foreground/50 text-xs">
                  <Command className="w-3 h-3" />
                  <CornerDownLeft className="w-3 h-3" />
                </div>
                <Button size="sm" rounded="lg">
                  Try it
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-muted-foreground/40 mb-6 pointer-events-none select-none"
            aria-hidden="true"
          >
            <span>✕</span>
            <span>◇</span>
            <span>✕</span>
            <span>◇</span>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              <span className="text-gradient-lime">200+</span> integrations supported
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">connect to n8n, Zapier, Make, and any webhook endpoint</p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button size="xl" rounded="full" className="gap-2 w-full sm:w-auto" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" rounded="full" className="gap-2 bg-transparent w-full sm:w-auto" asChild>
              <Link href="/login">
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute bottom-0 left-0 right-0 py-6 sm:py-8 border-t border-border/30 bg-background/80 backdrop-blur-sm"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm text-muted-foreground/60 mb-4 sm:mb-6 text-center">
            Integrates with your favorite tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-12 gap-y-3 sm:gap-y-4">
            {trustedLogos.map((logo) => (
              <span
                key={logo.name}
                className="text-base sm:text-lg md:text-xl font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
              >
                {logo.text}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
