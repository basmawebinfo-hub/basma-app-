"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { login } from "@/app/actions/auth"
import { useI18n } from "@/lib/i18n"

export default function LoginPage() {
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const bubbles = [
    { top: "0%", left: "0%", delay: 0, key: "auth.b1" },
    { top: "18%", left: "40%", delay: 0.4, key: "auth.b2" },
    { top: "42%", left: "5%", delay: 0.8, key: "auth.b3" },
    { top: "62%", left: "38%", delay: 1.2, key: "auth.b4" },
  ]
  const stats = [
    { value: "200+", key: "auth.statIntegrations" },
    { value: "99.9%", key: "auth.statUptime" },
    { value: t("hero.cta") === "Start Free" ? "Free" : "مجاناً", key: "auth.statFree" },
  ]

  return (
    <div className="min-h-screen bg-background flex relative">

      {/* Back to website - clear button, top corner */}
      <Link
        href="/"
        className="absolute top-5 end-5 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-card hover:border-primary/40 transition-all shadow-sm"
      >
        <span aria-hidden>&larr;</span> {t("auth.back")}
      </Link>


      {/* ── Left panel ── */}
      <div className="hidden lg:flex relative w-1/2 flex-col overflow-hidden bg-card border-e border-border">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 p-10">
          <Link href="/"><img src="/basma-logo.png" alt="BASMA" className="h-9 w-auto object-contain" /></Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 text-center">
          <div className="relative w-72 h-64 mb-10">
            {bubbles.map((bubble) => (
              <motion.div key={bubble.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bubble.delay, duration: 0.5 }} style={{ top: bubble.top, left: bubble.left }} className="absolute">
                <div className="px-4 py-2 rounded-2xl bg-secondary border border-border text-xs text-foreground whitespace-nowrap shadow-lg">{t(bubble.key)}</div>
              </motion.div>
            ))}
          </div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            {t("auth.headline1")}<br /><span className="text-primary">{t("auth.headline2")}</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-sm text-muted-foreground max-w-xs">{t("auth.subtext")}</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="flex items-center gap-8 mt-10">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center">
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{t(stat.key)}</p>
              </div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Link href="/"><img src="/basma-logo.png" alt="BASMA" className="h-8 w-auto object-contain" /></Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">{t("auth.welcome")}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2">{t("auth.signupFree")}</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">{t("auth.password")}</label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">{t("auth.forgot")}</Link>
              </div>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="w-full px-4 py-3 pe-11 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors" aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (<div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-xs text-destructive">{error}</p></div>)}
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t("auth.signingin") : t("auth.signin")}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  )
}
