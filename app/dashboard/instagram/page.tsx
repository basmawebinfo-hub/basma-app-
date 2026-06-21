"use client"
import { useEffect, useState, useCallback } from "react"
import { Instagram, Plus, Trash2, Loader2, Copy, Check, MessageCircle, Send } from "lucide-react"

type Rule = { id: string; name: string | null; trigger_type: string; match_type: string; keyword: string | null; reply_comment: string | null; reply_dm: string | null; is_active: boolean }

function Copyable({ value }: { value: string }) {
  const [c, setC] = useState(false)
  return <button onClick={() => { navigator.clipboard.writeText(value); setC(true); setTimeout(() => setC(false), 1500) }} className="p-2 rounded-md border border-border hover:bg-muted/40">{c ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
}

export default function InstagramAutomationPage() {
  const [conn, setConn] = useState<{ webhook_url: string; secret: string | null } | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const [trigger, setTrigger] = useState<"comment" | "dm">("comment")
  const [matchType, setMatchType] = useState<"contains" | "exact" | "any">("contains")
  const [keyword, setKeyword] = useState("")
  const [replyComment, setReplyComment] = useState("")
  const [replyDm, setReplyDm] = useState("")

  const load = useCallback(async () => {
    const [c, r] = await Promise.all([
      fetch("/api/make/connection").then((x) => x.json()).catch(() => null),
      fetch("/api/instagram/rules").then((x) => x.json()).catch(() => ({ rules: [] })),
    ])
    setConn(c); setRules(r.rules ?? []); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  async function addRule() {
    if (matchType !== "any" && !keyword.trim()) { alert("اكتب الكلمة المفتاحية"); return }
    if (!replyComment.trim() && !replyDm.trim()) { alert("اكتب رد (تعليق أو رسالة خاصة)"); return }
    setSaving(true)
    await fetch("/api/instagram/rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trigger_type: trigger, match_type: matchType, keyword, reply_comment: replyComment, reply_dm: replyDm }) })
    setKeyword(""); setReplyComment(""); setReplyDm(""); setSaving(false); load()
  }
  async function delRule(id: string) {
    if (!confirm("حذف القاعدة؟")) return
    await fetch("/api/instagram/rules?id=" + id, { method: "DELETE" }); load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2"><Instagram className="w-6 h-6 text-pink-500" /><h1 className="text-2xl font-bold">أتمتة إنستغرام</h1></div>
      <p className="text-sm text-muted-foreground">رد تلقائي على التعليقات والرسائل الخاصة بناءً على الكلمات المفتاحية — زي ManyChat، بالكامل من بصمة.</p>

      {/* Connection */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="text-base font-semibold mb-2">ربط إنستغرام (عبر Make)</h2>
        <p className="text-sm text-muted-foreground mb-4">اربط حسابك مرة واحدة عبر Make. استخدم الرابط والمفتاح دول في خطوة "HTTP" داخل Make. <a href="/dashboard/instagram/guide" className="text-primary hover:underline">دليل الإعداد خطوة بخطوة ←</a></p>
        <label className="text-xs text-muted-foreground">Webhook URL (يستقبل من Make)</label>
        <div className="flex items-center gap-2 mt-1 mb-3"><code className="flex-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs font-mono break-all">{conn?.webhook_url}</code><Copyable value={conn?.webhook_url ?? ""} /></div>
        <label className="text-xs text-muted-foreground">Secret (للتأكد إن الطلب من حسابك)</label>
        <div className="flex items-center gap-2 mt-1"><code className="flex-1 px-3 py-2 rounded-md bg-muted/30 border border-border text-xs font-mono break-all">{showSecret ? conn?.secret : "••••••••••••••••"}</code><button onClick={() => setShowSecret(!showSecret)} className="px-2 py-2 rounded-md border border-border text-xs">{showSecret ? "إخفاء" : "إظهار"}</button><Copyable value={conn?.secret ?? ""} /></div>
      </section>

      {/* Add rule */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="text-base font-semibold mb-4">إضافة قاعدة جديدة</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted-foreground">المُحفِّز</label>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as "comment" | "dm")} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
              <option value="comment">تعليق على منشور</option>
              <option value="dm">رسالة خاصة (DM)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">نوع المطابقة</label>
            <select value={matchType} onChange={(e) => setMatchType(e.target.value as "contains" | "exact" | "any")} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm">
              <option value="contains">يحتوي على الكلمة</option>
              <option value="exact">مطابقة تامة</option>
              <option value="any">أي رسالة (بدون كلمة)</option>
            </select>
          </div>
        </div>
        {matchType !== "any" && (
          <div className="mb-3">
            <label className="text-xs text-muted-foreground">الكلمة المفتاحية</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="مثال: سعر" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
          </div>
        )}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> الرد على التعليق (اختياري)</label>
          <input value={replyComment} onChange={(e) => setReplyComment(e.target.value)} placeholder="مثال: تم إرسال التفاصيل في الخاص ✅" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <div className="mb-4">
          <label className="text-xs text-muted-foreground flex items-center gap-1"><Send className="w-3.5 h-3.5" /> الرسالة الخاصة DM (اختياري)</label>
          <textarea value={replyDm} onChange={(e) => setReplyDm(e.target.value)} placeholder="مثال: أهلاً! الأسعار تبدأ من..." rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm" />
        </div>
        <button onClick={addRule} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} إضافة القاعدة
        </button>
      </section>

      {/* Rules list */}
      <section className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="text-base font-semibold mb-4">القواعد ({rules.length})</h2>
        {rules.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">لا توجد قواعد بعد. أضف أول قاعdة فوق.</p> : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500">{r.trigger_type === "dm" ? "رسالة" : "تعليق"}</span>
                    <span className="text-sm font-medium">{r.match_type === "any" ? "أي رسالة" : `"${r.keyword}"`}</span>
                  </div>
                  {r.reply_comment && <p className="text-xs text-muted-foreground truncate">↳ رد التعليق: {r.reply_comment}</p>}
                  {r.reply_dm && <p className="text-xs text-muted-foreground truncate">↳ DM: {r.reply_dm}</p>}
                </div>
                <button onClick={() => delRule(r.id)} className="p-2 rounded-md hover:bg-red-500/10 text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
