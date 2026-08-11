"use client"

import { useState } from "react"
import { PlayCircle, VideoOff } from "lucide-react"

/**
 * Vimeo embed that accepts whatever form the owner pastes.
 *
 * Handles:
 *   https://vimeo.com/123456789
 *   https://vimeo.com/123456789/abcdef123      ← unlisted, hash required
 *   https://player.vimeo.com/video/123456789
 *   123456789                                   ← bare id
 *   123456789/abcdef123
 *
 * The unlisted form matters most: course video is normally unlisted, and
 * dropping the hash makes the embed fail silently with a black box.
 *
 * CSP: `frame-src` must include https://player.vimeo.com (see next.config.mjs).
 */
export function parseVimeo(input: string): { id: string; hash?: string } | null {
  const raw = input.trim()
  if (!raw) return null

  // Bare id, optionally with an unlisted hash.
  const bare = raw.match(/^(\d+)(?:\/([a-zA-Z0-9]+))?$/)
  if (bare) return { id: bare[1], hash: bare[2] }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null

  // /video/ID (player.vimeo.com) or /ID or /ID/HASH
  const parts = url.pathname.split("/").filter(Boolean)
  const idIndex = parts[0] === "video" ? 1 : 0
  const id = parts[idIndex]
  if (!id || !/^\d+$/.test(id)) return null

  // Hash can be the next path segment or the ?h= query param.
  const hash = parts[idIndex + 1] ?? url.searchParams.get("h") ?? undefined
  return { id, hash: hash && /^[a-zA-Z0-9]+$/.test(hash) ? hash : undefined }
}

/** Shown when a level has no video yet — which is currently every level. */
function NoVideo({ message }: { message: string }) {
  return (
    <div className="aspect-video w-full border border-dashed border-border bg-card/40 flex flex-col items-center justify-center gap-3 text-center px-6">
      <VideoOff className="w-8 h-8 text-muted-foreground/60" aria-hidden="true" />
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  )
}

export function VimeoPlayer({
  src,
  title,
  emptyMessage,
  errorMessage,
}: {
  src?: string
  title: string
  emptyMessage: string
  errorMessage: string
}) {
  // Click-to-load: an iframe per level page would otherwise pull Vimeo's player
  // bundle on every visit, video watched or not.
  const [active, setActive] = useState(false)

  if (!src) return <NoVideo message={emptyMessage} />

  const parsed = parseVimeo(src)
  if (!parsed) return <NoVideo message={errorMessage} />

  const params = new URLSearchParams({ title: "0", byline: "0", portrait: "0", dnt: "1" })
  if (parsed.hash) params.set("h", parsed.hash)
  if (active) params.set("autoplay", "1")

  const embed = `https://player.vimeo.com/video/${parsed.id}?${params.toString()}`

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="group relative aspect-video w-full border border-border bg-card overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label={title}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-16 h-16 text-primary transition-transform group-hover:scale-105" aria-hidden="true" />
        </span>
      </button>
    )
  }

  return (
    <div className="aspect-video w-full border border-border bg-card overflow-hidden">
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
