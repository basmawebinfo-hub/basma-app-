"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const email = (new FormData(e.currentTarget).get("email") as string) ?? ""
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.basmaweb.com/auth/callback?next=/dashboard/settings",
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
        <div className="mb-8"><Link href="/"><img src="/basma-logo.png" alt="BASMA" className="h-9 w-auto object-contain" /></Link></div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">{t("forgot.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("forgot.subtitle")}</p>

        {sent ? (
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-4 text-sm text-foreground">{t("forgot.sent")}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">{t("auth.email")}</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
            </div>
            {error && (<div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-xs text-destructive">{error}</p></div>)}
            <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50">
              {loading ? t("forgot.sending") : t("forgot.send")}
            </button>
          </form>
        )}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          <Link href="/login" className="hover:text-foreground transition-colors">&larr; {t("forgot.backLogin")}</Link>
        </p>
      </motion.div>
    </div>
  )
}
