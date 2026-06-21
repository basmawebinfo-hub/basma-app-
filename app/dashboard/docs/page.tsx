"use client"
import Link from "next/link"
import { useState } from "react"
import { Copy, Check, ArrowRight, ArrowLeft, Webhook, Send, Image as ImageIcon, KeyRound } from "lucide-react"
import { useI18n } from "@/lib/i18n"

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto font-mono leading-relaxed">{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(()=>setCopied(false),1500) }}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-card border border-border opacity-0 group-hover:opacity-100 transition">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function DocsPage() {
  const { t } = useI18n()
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{t("doc.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("doc.subtitle")}</p>

      <Section icon={ArrowLeft} title={t("doc.s1")}>
        <p>Every incoming WhatsApp message can be forwarded to your automation platform in real time.</p>
        <p><b>Setup:</b> Go to <b>Webhooks</b> in the dashboard, add a new config, paste your platform's webhook URL, and select the events you want.</p>
        <p>BASMA will <b>POST</b> a JSON payload to your URL for each message. Example payload:</p>
        <Code>{`{
  "event": "messages.upsert",
  "instance": "your_instance_name",
  "data": {
    "key": {
      "id": "ABC123",
      "remoteJid": "201234567890@s.whatsapp.net",
      "fromMe": false
    },
    "message": { "conversation": "Hello!" },
    "pushName": "John Doe",
    "messageTimestamp": 1700000000,
    "messageType": "TEXT"
  }
}`}</Code>
        <p className="text-xs"><b>In n8n / Make, read fields like this:</b></p>
        <Code>{`Message text:  $json.body.data.message.conversation
Sender number: $json.body.data.key.remoteJid
Sender name:   $json.body.data.pushName
Message type:  $json.body.data.messageType   (TEXT / IMAGE / AUDIO / VIDEO / DOCUMENT)
Is from me:    $json.body.data.key.fromMe     (filter out true to avoid loops)`}</Code>
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">
          Important: always filter where <code>fromMe = false</code> so your bot does not reply to its own messages (infinite loop).
        </p>
      </Section>

      <Section icon={KeyRound} title={t("doc.s2")}>
        <p>Sending messages requires your personal API key. Get it from <b>Settings → API Key</b>.</p>
        <p>Pass it in the <code>Authorization</code> header on every request:</p>
        <Code>{`Authorization: Bearer bsm_live_xxxxxxxxxxxxxxxxxxxx`}</Code>
      </Section>

      <Section icon={Send} title={t("doc.s3")}>
        <p><b>POST</b> to <code>https://www.basmaweb.com/api/send</code></p>
        <Code>{`POST https://www.basmaweb.com/api/send
Authorization: Bearer bsm_live_xxxxx
Content-Type: application/json

{
  "to": "201234567890",
  "text": "Hello from automation"
}`}</Code>
        <p>If you have multiple numbers, add <code>"instance_id": "uuid"</code> to pick one. Otherwise it uses your first connected number.</p>
      </Section>

      <Section icon={ImageIcon} title={t("doc.s4")}>
        <p>Use the same endpoint with a <code>type</code> and <code>media</code> (URL or base64):</p>
        <Code>{`// Image
{ "to": "201234567890", "type": "image", "media": "https://example.com/pic.jpg", "caption": "Optional" }

// Video
{ "to": "201234567890", "type": "video", "media": "https://example.com/clip.mp4" }

// Audio / voice note
{ "to": "201234567890", "type": "audio", "media": "https://example.com/voice.mp3" }

// Document
{ "to": "201234567890", "type": "document", "media": "https://example.com/file.pdf", "fileName": "report.pdf" }`}</Code>
      </Section>

      <Section icon={ArrowLeft} title={t("doc.s5")}>
        <p>WhatsApp media is encrypted. To get the actual file bytes (e.g. to transcribe a voice note), call:</p>
        <Code>{`POST https://www.basmaweb.com/api/media
Authorization: Bearer bsm_live_xxxxx
Content-Type: application/json

{ "message_id": "ABC123" }

// Returns: { "base64": "...", "mimetype": "audio/ogg", "fileName": "...", "mediaType": "..." }`}</Code>
      </Section>

      <Section icon={Webhook} title={t("doc.s6")}>
        <p>A simple AI auto-reply workflow:</p>
        <Code>{`[Webhook Trigger]   <- incoming message from BASMA
      |
[IF fromMe = false] <- ignore your own messages
      |
[AI Agent / logic]  <- generate a reply
      |
[HTTP Request]      -> POST /api/send with the reply`}</Code>
        <p>The HTTP Request node body:</p>
        <Code>{`{
  "to": "{{ $('Webhook').item.json.body.data.key.remoteJid }}",
  "text": "{{ $json.output }}"
}`}</Code>
      </Section>

      <Section icon={Send} title="8. Location, Contact, Poll & Sticker">
        <p>Same <code>/api/send</code> endpoint, just change <code>type</code>:</p>
        <Code>{`// Location
{ "to": "201234567890", "type": "location", "latitude": 30.0444, "longitude": 31.2357, "name": "Cairo", "address": "Egypt" }

// Contact card
{ "to": "201234567890", "type": "contact", "contact": { "fullName": "Ahmed Ali", "phoneNumber": "201112223334" } }

// Poll
{ "to": "201234567890", "type": "poll", "question": "Pick a time", "options": ["9 AM", "2 PM", "6 PM"], "selectableCount": 1 }

// Sticker (.webp)
{ "to": "201234567890", "type": "sticker", "media": "https://example.com/sticker.webp" }`}</Code>
      </Section>

      <Section icon={ArrowRight} title="9. Quality: typing indicator & read receipts">
        <p>Make your bot feel human. Show "typing…" before replying, and mark messages as read (blue ticks).</p>
        <Code>{`// Show "typing…" for ~1.2s
POST https://www.basmaweb.com/api/presence
{ "to": "201234567890", "presence": "composing", "delay": 1200 }

// Mark a message as read (blue ticks)
POST https://www.basmaweb.com/api/mark-read
{ "remote_jid": "201234567890@s.whatsapp.net", "message_id": "ABC123" }`}</Code>
        <p className="text-xs">Presence values: <code>composing</code> (typing), <code>recording</code> (voice), <code>available</code> (online), <code>paused</code>.</p>
      </Section>

      <Section icon={Webhook} title="10. Groups">
        <Code>{`// Create a group
POST https://www.basmaweb.com/api/groups
{ "subject": "My Team", "participants": ["201112223334", "201556667778"] }

// List all groups
GET https://www.basmaweb.com/api/groups

// Add / remove / promote / demote members
POST https://www.basmaweb.com/api/groups/participants
{ "group_jid": "12036...@g.us", "action": "add", "participants": ["201112223334"] }

// Send to a group with @mentions
POST https://www.basmaweb.com/api/send
{ "to": "12036...@g.us", "text": "Hello @everyone", "mentions": ["201112223334"] }`}</Code>
      </Section>

      <Section icon={KeyRound} title="11. Contacts">
        <Code>{`// List all contacts
GET https://www.basmaweb.com/api/contacts

// Get one contact's picture + WhatsApp status
GET https://www.basmaweb.com/api/contacts?number=201112223334`}</Code>
      </Section>

      <Section icon={ArrowRight} title={t("doc.s7")}>
        <Code>{`200  Success
401  Missing or invalid API key
403  Account suspended
404  No matching instance
429  Monthly message limit reached (paid plans are unlimited)
502  WhatsApp/Evolution error`}</Code>
      </Section>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Link href="/dashboard/docs/sdk" className="rounded-xl border border-border bg-card/40 p-4 hover:border-primary/40 transition-colors">
          <h3 className="font-semibold text-foreground mb-1">{t("sdk.link")}</h3>
          <p className="text-xs text-muted-foreground">{t("sdk.desc")}</p>
        </Link>
        <Link href="/dashboard/docs/mcp" className="rounded-xl border border-border bg-card/40 p-4 hover:border-primary/40 transition-colors">
          <h3 className="font-semibold text-foreground mb-1">{t("mcp.link")}</h3>
          <p className="text-xs text-muted-foreground">{t("mcp.desc")}</p>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card/30 p-5 text-sm">
        <b>{t("doc.help")}</b> {t("doc.helpDesc")}
      </div>
    </div>
  )
}
