"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, MessageSquare, Check } from "lucide-react"
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
    <div className="min-h-screen bg-[#0e0e0e] flex items-stretch">
      {/* ── Left panel — image ── */}
      <div className="hidden lg:flex relative w-[480px] shrink-0 flex-col overflow-hidden">
        <Image
          src="/auth-panel.png"
          alt="Basma Web — WhatsApp platform"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2 p-8">
          <MessageSquare className="w-5 h-5 text-[#a8e063]" />
          <span className="font-mono font-bold text-sm text-white tracking-[-0.05em]">
            BASMA
          </span>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 mt-auto p-8">
          <p className="text-white/90 text-2xl font-light leading-snug text-balance">
            Connect WhatsApp
            <br />
            <span className="text-[#a8e063]">to any tool.</span>
          </p>
          <p className="mt-3 text-white/40 text-sm">
            Webhooks. Inbox. Automation. All in one place.
          </p>
          {/* Feature bullets */}
          <ul className="mt-6 space-y-2">
            {["Free to start", "200+ integrations", "Under 30-second setup"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                <span className="w-4 h-4 rounded-full bg-[#a8e063]/20 flex items-center justify-center shrink-0">
                  <Check size={10} className="text-[#a8e063]" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#111]">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <MessageSquare className="w-5 h-5 text-[#a8e063]" />
            <span className="font-mono font-bold text-sm text-white tracking-[-0.05em]">BASMA</span>
          </div>

          {success ? (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#a8e063]/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-[#a8e063]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-sm text-white/40">
                We sent a confirmation link to your inbox. Click it to activate your account.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm text-[#a8e063] hover:text-[#c5f085] transition-colors underline underline-offset-2"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                Create an account
              </h1>
              <p className="text-sm text-white/40 mb-8">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#a8e063] hover:text-[#c5f085] transition-colors underline underline-offset-2"
                >
                  Log in
                </Link>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-firstname" className="block text-xs font-medium text-white/50 tracking-wide uppercase">
                      First name
                    </label>
                    <input
                      id="reg-firstname"
                      name="first_name"
                      type="text"
                      required
                      placeholder="Ahmed"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8e063]/40 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="reg-lastname" className="block text-xs font-medium text-white/50 tracking-wide uppercase">
                      Last name
                    </label>
                    <input
                      id="reg-lastname"
                      name="last_name"
                      type="text"
                      required
                      placeholder="Mohamed"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8e063]/40 focus:bg-white/[0.07] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-xs font-medium text-white/50 tracking-wide uppercase">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8e063]/40 focus:bg-white/[0.07] transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-password" className="block text-xs font-medium text-white/50 tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8e063]/40 focus:bg-white/[0.07] transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-confirm" className="block text-xs font-medium text-white/50 tracking-wide uppercase">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      name="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#a8e063]/40 focus:bg-white/[0.07] transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all
                      ${agreed
                        ? "bg-[#a8e063] border-[#a8e063]"
                        : "bg-white/[0.05] border-white/[0.15] group-hover:border-white/30"
                      }`}
                    onClick={() => setAgreed((v) => !v)}
                    role="checkbox"
                    aria-checked={agreed}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && setAgreed((v) => !v)}
                  >
                    {agreed && <Check size={10} className="text-black" />}
                  </div>
                  <span className="text-xs text-white/40 leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
                      Terms &amp; Conditions
                    </a>
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-1 bg-[#a8e063] text-[#0e0e0e] text-sm font-semibold rounded-xl hover:bg-[#bfee7a] active:bg-[#93cc52] transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              {/* Back to landing */}
              <p className="mt-6 text-center text-xs text-white/20">
                <Link href="/" className="hover:text-white/40 transition-colors">
                  &larr; Back to website
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
