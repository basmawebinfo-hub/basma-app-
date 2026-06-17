"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    return { error: error.message }
  }

  // Route admins straight to the admin panel, everyone else to the dashboard
  const uid = signInData.user?.id
  if (uid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single()
    if (profile?.role === "admin" || profile?.role === "super_admin") {
      redirect("/admin")
    }
  }

  redirect("/dashboard")
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const headersList = await headers()
  const origin = headersList.get("origin") ?? ""

  const firstName = (formData.get("first_name") as string | null) ?? ""
  const lastName = (formData.get("last_name") as string | null) ?? ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If we have a session immediately → email confirmation is OFF → go to dashboard
  if (data.session) {
    redirect("/dashboard")
  }

  // Email confirmation is ON → try signing in immediately with the same credentials
  // (works when Supabase "confirm email" is disabled at the project level)
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (!signInError && signInData.session) {
    redirect("/dashboard")
  }

  // Fall back to "check your email" screen
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
