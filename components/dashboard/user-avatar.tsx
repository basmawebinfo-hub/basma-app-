"use client"
import { useEffect, useState } from "react"

export function UserAvatar() {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [name, setName] = useState("")
  useEffect(() => {
    fetch("/api/user/profile").then((r) => r.json()).then((d) => { setAvatar(d.avatar_url ?? null); setName(d.full_name ?? d.email ?? "") }).catch(() => {})
  }, [])
  const initials = (name || "?").slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
      {avatar ? <img src={avatar} alt="me" className="w-full h-full object-cover" /> : initials}
    </div>
  )
}
