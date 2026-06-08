"use client"

import { useState } from "react"
import Link from "next/link"
import { register } from "@/app/actions/auth"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-4">
      <div className="bg-white border border-black/[0.07] rounded-2xl p-10 w-full max-w-md shadow-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-[family-name:var(--font-pt-mono)] text-xs tracking-[0.25em] text-black/40">
            BASMA
          </span>
          <h1 className="mt-4 text-2xl font-light text-[#111] tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-black/40">Start managing WhatsApp for free</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reg-fullname" className="block text-xs text-black/50 tracking-wide">
              Full Name
            </label>
            <input
              id="reg-fullname"
              name="full_name"
              type="text"
              required
              placeholder="Ahmed Mohamed"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs text-black/50 tracking-wide">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block text-xs text-black/50 tracking-wide">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className="block text-xs text-black/50 tracking-wide">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              name="confirm_password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-black/35">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black/60 hover:text-black transition-colors underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
