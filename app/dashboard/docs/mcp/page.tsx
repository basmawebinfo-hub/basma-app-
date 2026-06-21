"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Bot } from "lucide-react"
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

export default function McpPage() {
  const { t } = useI18n()
  const toolDef = `{
  "name": "send_whatsapp_message",
  "description": "Send a WhatsApp message to a phone number via BASMA",
  "input_schema": {
    "type": "object",
    "properties": {
      "to":   { "type": "string", "description": "Phone number, e.g. 201234567890" },
      "text": { "type": "string", "description": "Message text" }
    },
    "required": ["to", "text"]
  }
}

// When the AI calls this tool, run:
POST https://www.basmaweb.com/api/send
Authorization: Bearer bsm_live_xxxxx
{ "to": "<to>", "text": "<text>" }`;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/docs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> {t("doc.title")}</Link>
      <div className="flex items-center gap-2 mb-2"><Bot className="w-6 h-6 text-primary" /><h1 className="text-3xl font-bold">{t("mcp.title")}</h1></div>
      <p className="text-muted-foreground mb-8">{t("mcp.desc")}</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">{t("mcp.s1")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("mcp.s1d")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">{t("mcp.s2")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("mcp.s2d")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">{t("mcp.s3")}</h2>
        <Code>{toolDef}</Code>
      </section>
    </div>
  )
}
