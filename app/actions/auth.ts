"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })

  if (error) {
    return { error: error.message }
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

  // If Supabase email confirmation is enabled, the user won't have a session
  // yet — show the "check your email" success screen instead of redirecting.
  if (data.session) {
    redirect("/dashboard")
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
