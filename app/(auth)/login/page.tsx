"use client"

import { useState } from "react"
import Link from "next/link"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-4">
      <div className="bg-white border border-black/[0.07] rounded-2xl p-10 w-full max-w-md shadow-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-[family-name:var(--font-pt-mono)] text-xs tracking-[0.25em] text-black/40">
            BASMA
          </span>
          <h1 className="mt-4 text-2xl font-light text-[#111] tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-black/40">Sign in to your Basma account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs text-black/50 tracking-wide">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs text-black/50 tracking-wide">
                Password
              </label>
              <a href="#" className="text-xs text-black/35 hover:text-black/60 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              name="password"
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
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-black/35">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="text-black/60 hover:text-black transition-colors underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
