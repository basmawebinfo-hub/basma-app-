"use client"

import type { ReactNode } from "react"
import { Children, isValidElement } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Renders a level body.
 *
 * The source uses bold lead-in labels rather than headings to mark each part of
 * a section — `**الشرح:**`, `**مثال عملي:**`, `**مصادر:**`, `**أسئلة تقييم:**`,
 * `**تمرين:**`. Those labels carry the structure, and rendering them as plain
 * bold text produces exactly the failure this page has to avoid: an
 * undifferentiated wall of Arabic.
 *
 * So each label gets its own visual treatment. Labels are matched loosely
 * because the source is inconsistent ("الشرح" vs "الشرح المبسط", "مصادر" vs
 * "مصادر ومراجع"), and anything unmatched falls back to a normal paragraph —
 * new labels degrade quietly instead of breaking.
 */

type Role = "goal" | "example" | "sources" | "assessment" | "exercise" | "warning" | "rule" | null

function roleFor(label: string): Role {
  const l = label.replace(/[:：]\s*$/, "").trim()
  if (/^هدف/.test(l)) return "goal"
  if (/^مثال/.test(l)) return "example"
  if (/^مصادر|^مراجع/.test(l)) return "sources"
  if (/^أسئلة/.test(l)) return "assessment"
  if (/^تمرين/.test(l)) return "exercise"
  if (/^تحذير/.test(l)) return "warning"
  if (/^قاعدة/.test(l)) return "rule"
  return null
}

/**
 * Role treatments.
 *
 * An earlier version gave each role a thick coloured border on one side. The
 * Impeccable detector flags that (`side-tab`) as the most recognisable tell of
 * AI-generated UI, and with six of them stacked down a page it was right — the
 * page read as a template rather than as a document.
 *
 * These are quiet instead: a soft fill separates a callout from body text, and
 * the bold label already carries the meaning. Sources get no fill at all —
 * they're a footnote, not a highlight, so they recede.
 */
const ROLE_CLASS: Record<Exclude<Role, null>, string> = {
  // The goal opens the page and answers "why am I reading this" — the only
  // role that gets a full outlined card.
  goal: "border border-primary/25 bg-primary/5 p-5 text-foreground/90",
  example: "bg-card/60 p-5",
  sources: "pt-4 mt-8 border-t border-border text-sm",
  assessment: "bg-elevated/60 p-5",
  exercise: "bg-success/5 p-5",
  warning: "bg-warning/10 p-5 text-foreground/90",
  rule: "bg-primary/5 p-5 text-foreground/90",
}

/** Flatten a React node to its plain text, however deeply nested. */
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child)
      if (isValidElement(child)) return textOf((child.props as { children?: ReactNode }).children)
      return ""
    })
    .join("")
}

/**
 * Text of the leading bold label, if the paragraph starts with one.
 *
 * Deliberately does NOT check `first.type === "strong"`: `strong` is overridden
 * below, so by the time these children arrive the element's type is that custom
 * component, not the string "strong". Matching on type silently never fired and
 * every label rendered as a plain paragraph.
 *
 * Instead: the paragraph must start with an element (not bare text) whose text
 * ends in a colon and is short enough to be a label rather than a sentence.
 */
function leadingLabel(children: ReactNode): string | null {
  const first = Children.toArray(children)[0]
  if (!isValidElement(first)) return null
  const text = textOf((first.props as { children?: ReactNode }).children).trim()
  if (!text.endsWith(":") || text.length > 40) return null
  return text
}

export function LevelContent({ body }: { body: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-14 mb-5 scroll-mt-28 border-t border-border pt-8 first:mt-0 first:border-0 first:pt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">{children}</h3>
          ),
          p: ({ children }) => {
            const label = leadingLabel(children)
            const role = label ? roleFor(label) : null
            if (role) {
              return <div className={`my-5 text-muted-foreground leading-loose ${ROLE_CLASS[role]}`}>{children}</div>
            }
            return <p className="my-5 text-muted-foreground leading-loose">{children}</p>
          },
          ul: ({ children }) => (
            <ul className="my-5 space-y-2 text-muted-foreground leading-loose ps-5 list-disc marker:text-primary/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 space-y-2 text-muted-foreground leading-loose ps-5 list-decimal marker:text-primary/60">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ps-1">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary break-words"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          // Workflow diagrams are fenced blocks. `dir="ltr"` keeps ASCII arrows
          // from being reordered by the RTL document, and the wrapper scrolls
          // instead of forcing the page wide on mobile.
          pre: ({ children }) => (
            <div className="my-6 overflow-x-auto border border-border bg-elevated">
              <pre dir="ltr" className="p-4 text-sm font-mono leading-relaxed text-foreground/90">
                {children}
              </pre>
            </div>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className)
            if (isBlock) return <code className={className}>{children}</code>
            return (
              <code dir="ltr" className="mx-0.5 bg-elevated px-1.5 py-0.5 text-[0.9em] font-mono text-primary">
                {children}
              </code>
            )
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-elevated">{children}</thead>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-start font-semibold text-foreground border-b border-border">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-muted-foreground border-b border-border/60 align-top">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-s-2 border-primary/50 ps-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-border" />,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  )
}
