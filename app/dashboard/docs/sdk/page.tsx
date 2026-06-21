"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Package } from "lucide-react"
import { useI18n } from "@/lib/i18n"

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto font-mono leading-relaxed">{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        className="absolute top-2 end-2 p-1.5 rounded-md bg-card border border-border opacity-0 group-hover:opacity-100 transition">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default function SdkPage() {
  const { t } = useI18n()
  const [lang, setLang] = useState<"node" | "python">("node")

  const nodeCode = `// basma.js — minimal BASMA WhatsApp SDK (Node.js, zero deps)
const BASE = "https://www.basmaweb.com";

export class Basma {
  constructor(apiKey) { this.apiKey = apiKey; }
  async _post(path, body) {
    const r = await fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + this.apiKey },
      body: JSON.stringify(body),
    });
    return r.json();
  }
  // Messaging
  sendText(to, text)            { return this._post("/api/send", { to, text }); }
  sendImage(to, media, caption) { return this._post("/api/send", { to, type: "image", media, caption }); }
  sendVideo(to, media, caption) { return this._post("/api/send", { to, type: "video", media, caption }); }
  sendAudio(to, media)          { return this._post("/api/send", { to, type: "audio", media }); }
  sendDocument(to, media, fileName) { return this._post("/api/send", { to, type: "document", media, fileName }); }
  sendLocation(to, latitude, longitude, name) { return this._post("/api/send", { to, type: "location", latitude, longitude, name }); }
  sendContact(to, contact)      { return this._post("/api/send", { to, type: "contact", contact }); }
  sendPoll(to, question, options) { return this._post("/api/send", { to, type: "poll", question, options }); }
  // Quality
  typing(to, ms = 1500)         { return this._post("/api/presence", { to, presence: "composing", delay: ms }); }
  markRead(remote_jid, message_id) { return this._post("/api/mark-read", { remote_jid, message_id }); }
  // Groups
  createGroup(subject, participants) { return this._post("/api/groups", { subject, participants }); }
}

// Usage:
const wa = new Basma("bsm_live_xxxxx");
await wa.typing("201234567890");
await wa.sendText("201234567890", "Hello from BASMA!");`;

  const pyCode = `# basma.py — minimal BASMA WhatsApp SDK (Python, requests)
import requests

class Basma:
    BASE = "https://www.basmaweb.com"
    def __init__(self, api_key):
        self.h = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    def _post(self, path, body):
        return requests.post(self.BASE + path, json=body, headers=self.h).json()
    # Messaging
    def send_text(self, to, text):            return self._post("/api/send", {"to": to, "text": text})
    def send_image(self, to, media, caption=""): return self._post("/api/send", {"to": to, "type": "image", "media": media, "caption": caption})
    def send_document(self, to, media, file_name=""): return self._post("/api/send", {"to": to, "type": "document", "media": media, "fileName": file_name})
    def send_location(self, to, lat, lng, name=""): return self._post("/api/send", {"to": to, "type": "location", "latitude": lat, "longitude": lng, "name": name})
    def send_poll(self, to, question, options): return self._post("/api/send", {"to": to, "type": "poll", "question": question, "options": options})
    # Quality
    def typing(self, to, ms=1500):            return self._post("/api/presence", {"to": to, "presence": "composing", "delay": ms})
    def mark_read(self, remote_jid, message_id): return self._post("/api/mark-read", {"remote_jid": remote_jid, "message_id": message_id})
    # Groups
    def create_group(self, subject, participants): return self._post("/api/groups", {"subject": subject, "participants": participants})

# Usage:
wa = Basma("bsm_live_xxxxx")
wa.typing("201234567890")
wa.send_text("201234567890", "Hello from BASMA!")`;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/docs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> {t("doc.title")}</Link>
      <div className="flex items-center gap-2 mb-2"><Package className="w-6 h-6 text-primary" /><h1 className="text-3xl font-bold">{t("sdk.title")}</h1></div>
      <p className="text-muted-foreground mb-6">{t("sdk.desc")}</p>

      <div className="inline-flex rounded-lg border border-border p-1 mb-5">
        <button onClick={() => setLang("node")} className={"px-4 py-1.5 rounded-md text-sm font-medium transition " + (lang === "node" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Node.js</button>
        <button onClick={() => setLang("python")} className={"px-4 py-1.5 rounded-md text-sm font-medium transition " + (lang === "python" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Python</button>
      </div>

      <Code>{lang === "node" ? nodeCode : pyCode}</Code>

      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">{t("sdk.note")}</p>
      </div>
    </div>
  )
}
