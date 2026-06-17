"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, MessageSquare, Check } from "lucide-react"
import { motion } from "framer-motion"
import { register } from "@/app/actions/auth"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) {
      setError("Please agree to the Terms & Conditions to continue.")
      return
    }
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirm = formData.get("confirm_password") as string

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      setLoading(false)
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex relative w-1/2 flex-col overflow-hidden bg-card border-r border-border">

        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Lime glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5 p-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold text-foreground tracking-tight">basma</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 text-center">
          {/* Floating chat bubbles */}
          <div className="relative w-72 h-64 mb-10">
            {[
              { top: "0%",   left: "0%",   delay: 0,   msg: "Order confirmed ✓" },
              { top: "18%",  left: "40%",  delay: 0.4, msg: "New lead from web 🎯" },
              { top: "42%",  left: "5%",   delay: 0.8, msg: "Payment received 💳" },
              { top: "62%",  left: "38%",  delay: 1.2, msg: "Webhook sent ⚡" },
            ].map((bubble) => (
              <motion.div
                key={bubble.msg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bubble.delay, duration: 0.5 }}
                style={{ top: bubble.top, left: bubble.left }}
                className="absolute"
              >
                <div className="px-4 py-2 rounded-2xl bg-secondary border border-border text-xs text-foreground whitespace-nowrap shadow-lg">
                  {bubble.msg}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-foreground mb-3 tracking-tight"
          >
            Connect WhatsApp<br />
            <span className="text-primary">to any tool</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-sm text-muted-foreground max-w-xs"
          >
            Webhooks, inbox, and automation — all in one place.
          </motion.p>

          {/* Features list */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 space-y-3"
          >
            {[
              "Free to start — no credit card",
              "Connect in under 30 seconds",
              "200+ integration destinations",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-primary" />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Back to website */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            &larr; Back to website
          </Link>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-mono font-bold text-foreground tracking-tight">basma</span>
          </div>

          {success ? (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Account under review</h2>
              <p className="text-sm text-muted-foreground">
                Thanks for signing up! Your account is being reviewed and your payment is being confirmed.
                Our team will contact you on WhatsApp shortly to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                &larr; Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium underline underline-offset-2">
                  Log in
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="block text-xs font-medium text-muted-foreground">
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      placeholder="Ahmed"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="block text-xs font-medium text-muted-foreground">
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      placeholder="Mohamed"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* WhatsApp number */}
                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="block text-xs font-medium text-muted-foreground">
                    WhatsApp number (so we can contact you)
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    required
                    placeholder="+20 100 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="block text-xs font-medium text-muted-foreground">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <button
                  type="button"
                  onClick={() => setAgreed((v) => !v)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                      agreed ? "bg-primary border-primary" : "bg-secondary border-border"
                    }`}
                  >
                    {agreed && <Check size={10} className="text-primary-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <span className="text-foreground/60 underline underline-offset-2">Terms &amp; Conditions</span>
                  </span>
                </button>

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-1 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground/40 lg:hidden">
                <Link href="/" className="hover:text-muted-foreground transition-colors">
                  &larr; Back to website
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
