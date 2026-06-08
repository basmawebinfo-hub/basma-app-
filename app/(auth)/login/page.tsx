"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, MessageSquare } from "lucide-react"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
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

  return (
    <div className="min-h-screen bg-background flex items-stretch">
      {/* ── Left panel — image ── */}
      <div className="hidden lg:flex relative w-[480px] shrink-0 flex-col overflow-hidden">
        <Image
          src="/auth-panel.png"
          alt="Basma Web — WhatsApp platform"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Brand top-left */}
        <div className="relative z-10 flex items-center gap-2 p-8">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-[family-name:var(--font-pt-mono)] font-bold text-sm text-foreground tracking-[-0.05em]">
            BASMA
          </span>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 mt-auto p-8">
          <p className="text-foreground/90 text-2xl font-light leading-snug text-balance">
            Connect WhatsApp
            <br />
            <span className="text-primary">to any tool.</span>
          </p>
          <p className="mt-3 text-foreground/40 text-sm">
            Webhooks. Inbox. Automation. All in one place.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-card">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-[family-name:var(--font-pt-mono)] font-bold text-sm text-foreground tracking-[-0.05em]">
              BASMA
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
            >
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-muted-foreground tracking-wide uppercase"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:bg-secondary/80 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-muted-foreground tracking-wide uppercase"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:bg-secondary/80 transition-all"
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

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 active:bg-primary/80 transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground/40">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Back to landing */}
          <p className="text-center text-xs text-muted-foreground/40">
            <Link href="/" className="hover:text-muted-foreground transition-colors">
              &larr; Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
