"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Check } from "lucide-react"
import { motion } from "framer-motion"
import { register } from "@/app/actions/auth"
import { useI18n } from "@/lib/i18n"

export default function RegisterPage() {
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) { setError(t("reg.agreeError")); return }
    setLoading(true); setError(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirm = formData.get("confirm_password") as string
    if (password.length < 8) { setError(t("reg.pwShort")); setLoading(false); return }
    if (password !== confirm) { setError(t("reg.pwMismatch")); setLoading(false); return }
    const result = await register(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else if (result?.success) { setSuccess(true); setLoading(false) }
  }

  const bubbles = [
    { top: "0%", left: "0%", delay: 0, key: "auth.b1" },
    { top: "18%", left: "40%", delay: 0.4, key: "auth.b2" },
    { top: "42%", left: "5%", delay: 0.8, key: "auth.b3" },
    { top: "62%", left: "38%", delay: 1.2, key: "auth.b4" },
  ]
  const inputCls = "w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"

  return (
    <div className="min-h-screen bg-background flex relative">

      {/* Back to website - clear button */}
      <Link href="/" className="absolute top-5 end-5 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-card hover:border-primary/40 transition-all shadow-sm">
        <span aria-hidden>&larr;</span> {t("auth.back")}
      </Link>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex relative w-1/2 flex-col overflow-hidden bg-card border-e border-border">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 p-10">
          <Link href="/"><img src="/basma-logo.png" alt="BASMA" className="h-9 w-auto object-contain" /></Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 text-center">
          <div className="relative w-72 h-64 mb-10">
            {bubbles.map((b) => (
              <motion.div key={b.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: b.delay, duration: 0.5 }} style={{ top: b.top, left: b.left }} className="absolute">
                <div className="px-4 py-2 rounded-2xl bg-secondary border border-border text-xs text-foreground whitespace-nowrap shadow-lg">{t(b.key)}</div>
              </motion.div>
            ))}
          </div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            {t("auth.headline1")}<br /><span className="text-primary">{t("auth.headline2")}</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-sm text-muted-foreground max-w-xs">{t("auth.subtext")}</motion.p>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="mt-8 space-y-3">
            {["reg.f1", "reg.f2", "reg.f3"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Check size={11} className="text-primary" /></span>
                {t(item)}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden"><Link href="/"><img src="/basma-logo.png" alt="BASMA" className="h-8 w-auto object-contain" /></Link></div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5"><Check className="w-7 h-7 text-primary" /></div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("reg.successTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("reg.successDesc")}</p>
              <Link href="/login" className="inline-block mt-6 text-sm text-primary hover:text-primary/80 transition-colors font-medium">&larr; {t("forgot.backLogin")}</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">{t("reg.title")}</h1>
              <p className="text-sm text-muted-foreground mb-8">
                {t("reg.haveAccount")}{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2">{t("reg.login")}</Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="block text-xs font-medium text-muted-foreground">{t("reg.firstName")}</label>
                    <input id="first_name" name="first_name" type="text" required placeholder="Ahmed" className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="block text-xs font-medium text-muted-foreground">{t("reg.lastName")}</label>
                    <input id="last_name" name="last_name" type="text" required placeholder="Mohamed" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="block text-xs font-medium text-muted-foreground">{t("reg.whatsapp")}</label>
                  <input id="whatsapp" name="whatsapp" type="tel" required placeholder="+20 100 000 0000" className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">{t("auth.password")}</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="new-password" placeholder={t("reg.passwordHint")} className={inputCls + " pe-11"} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="block text-xs font-medium text-muted-foreground">{t("reg.confirmPassword")}</label>
                  <div className="relative">
                    <input id="confirm_password" name="confirm_password" type={showConfirm ? "text" : "password"} required autoComplete="new-password" placeholder="••••••••" className={inputCls + " pe-11"} />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <button type="button" onClick={() => setAgreed((v) => !v)} className="flex items-start gap-3 w-full text-start">
                  <div className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${agreed ? "bg-primary border-primary" : "bg-secondary border-border"}`}>{agreed && <Check size={10} className="text-primary-foreground" />}</div>
                  <span className="text-xs text-muted-foreground leading-relaxed">{t("reg.agree")} <Link href="/terms" className="text-foreground/60 underline underline-offset-2">{t("reg.terms")}</Link></span>
                </button>
                {error && (<div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-xs text-destructive">{error}</p></div>)}
                <button type="submit" disabled={loading} className="w-full py-3 mt-1 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? t("reg.creating") : t("reg.create")}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
