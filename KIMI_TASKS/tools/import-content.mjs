// One-off importer: builds content/courses/ai-automation-engineer from the
// source material in BasmaProgram.
//
//   • Levels 1–4  → full written content, status: published
//   • Levels 5–14 → status: coming-soon, with the real topic list from the
//                   roadmap PDF so the page is useful rather than blank
//
// Titles and topics come from the roadmap PDF (extracted to _roadmap.txt).
// Arabic subtitles are transcribed by hand: the PDF's bidi text extraction
// reverses mixed Arabic/Latin runs ("؟Backendيعني إيه"), so anything
// containing Arabic is retyped rather than trusted.
//
// After this runs, content/ is the source of truth. The owner edits those
// files; this script is not part of the build.
//
// Usage: node KIMI_TASKS/tools/import-content.mjs
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises"
import path from "node:path"

const SRC = "D:/Basma agancy/BasmaProgram"
const COURSE = "ai-automation-engineer"
const DEST = path.join(process.cwd(), "content", "courses", COURSE, "levels")

const WRITTEN = [
  { file: "Level-01-AI-Problem-Solver.md", slug: "01-ai-problem-solver", order: 1 },
  { file: "Level-02-Python-Fundamentals.md", slug: "02-python-fundamentals", order: 2 },
  { file: "Level-03-Developer-Foundations.md", slug: "03-developer-foundations", order: 3 },
  { file: "Level-04-Web-APIs-Webhooks.md", slug: "04-web-apis-webhooks", order: 4 },
]

// Real titles from the roadmap. Subtitles retyped from the same source.
const PLANNED = [
  { order: 5,  slug: "05-backend-development-databases", title: "Backend Development & Databases", subtitle: "اتعلم إزاي تبني الـ Backend وقواعد البيانات",
    topics: ["FastAPI", "Routes", "Endpoints", "Requests & Responses", "Pydantic", "Authentication", "Authorization", "Error Handling", "Background Tasks", "PostgreSQL", "SQL", "ORM"] },
  { order: 6,  slug: "06-javascript-typescript-modern-web", title: "JavaScript, TypeScript & Modern Web", subtitle: "هتتعلم JavaScript و TypeScript بالقدر اللي يخدم الـ AI Automation",
    topics: ["JavaScript", "TypeScript", "Node.js", "npm", "React", "Next.js", "Frontend Basics", "Async / Await", "Fetch API"] },
  { order: 7,  slug: "07-ai-engineering-llm-applications", title: "AI Engineering & LLM Applications", subtitle: "اتعلم إزاي تبني تطبيقات باستخدام الذكاء الاصطناعي",
    topics: ["LLM APIs", "OpenAI API", "Anthropic API", "Streaming", "Token Management", "Cost Control", "Structured Output", "Error Handling", "Evaluation"] },
  { order: 8,  slug: "08-rag-ai-tools-agents", title: "RAG, AI Tools & AI Agents", subtitle: "اتعلم إزاي تبني AI Agents ذكية تعرف تستخدم الأدوات والبيانات",
    topics: ["Function Calling", "Tool Calling", "Embeddings", "Vector Databases", "Chunking", "Retrieval", "RAG", "Agent Loops", "Memory"] },
  { order: 9,  slug: "09-ai-automation-engineering", title: "AI Automation Engineering", subtitle: "اتعلم إزاي تصمم Automation Systems احترافية",
    topics: ["n8n", "Make", "Zapier", "Workflow Design", "Error Handling", "Retries", "Queues", "Scheduling", "Idempotency"] },
  { order: 10, slug: "10-real-world-automation-systems", title: "Real-World AI Automation Systems", subtitle: "هتبدأ تطبق كل اللي اتعلمته على مشاريع قريبة من احتياجات السوق",
    topics: ["End-to-End Projects", "Requirements", "System Design", "Integration", "Testing", "Handover"] },
  { order: 11, slug: "11-deployment", title: "Deployment", subtitle: "هتتعلم إزاي تحول المشاريع من مجرد Prototype إلى Systems شغالة",
    topics: ["Linux", "VPS", "Cloud Basics", "Docker", "Docker Compose", "Domains", "DNS", "SSL", "Environment Variables", "Logs", "Monitoring", "Backups", "Security"] },
  { order: 12, slug: "12-vibe-coding", title: "Vibe Coding", subtitle: "اتعلم إزاي تستخدم AI عشان تبني أسرع",
    topics: ["AI as a Coding Partner", "Project Planning with AI", "Architecture with AI", "Debugging with AI", "Code Review", "Refactoring", "Testing", "Documentation"] },
  { order: 13, slug: "13-vibe-automation", title: "Vibe Automation", subtitle: "اتعلم إزاي تستخدم AI في اكتشاف المشاكل وتحليل الـ Processes",
    topics: ["Problem Discovery with AI", "Research with AI", "Process Analysis", "Opportunity Mapping", "Solution Design"] },
  { order: 14, slug: "14-ai-automation-business", title: "AI Automation Business & Client Delivery", subtitle: "اتعلم إزاي تحول مهارتك إلى Business حقيقي",
    topics: ["Choosing a Niche", "Market Research", "Finding Clients", "Lead Generation", "Cold Outreach", "Demos", "Portfolio", "Case Studies", "Pricing", "Contracts", "Delivery"] },
]

const esc = (s) => String(s).replace(/"/g, '\\"')

function frontmatter(fields) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${typeof v === "number" ? v : `"${esc(v)}"`}`)
  return `---\n${lines.join("\n")}\n---\n\n`
}

await mkdir(DEST, { recursive: true })

for (const lvl of WRITTEN) {
  const raw = await readFile(path.join(SRC, lvl.file), "utf8")

  const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? lvl.slug
  const subtitle = raw.match(/^###\s+(.+)$/m)?.[1]?.trim() ?? ""
  const title = h1.replace(/^LEVEL\s+\d+\s*[—–-]\s*/i, "").trim()

  // Strip the H1/H3 — the page renders title and subtitle itself, and leaving
  // them in the body would print both twice.
  const body = raw
    .replace(/^#\s+.+$/m, "")
    .replace(/^###\s+.+$/m, "")
    .replace(/^\s*---\s*$/m, "")
    .trim()

  await writeFile(
    path.join(DEST, `${lvl.slug}.md`),
    frontmatter({ title, titleAr: title, subtitle, order: lvl.order, status: "published" }) + body + "\n",
    "utf8",
  )
  console.log(`published  ${lvl.slug}  (${body.length} chars)`)
}

for (const lvl of PLANNED) {
  const body = ["## هتتعلم إيه في المستوى ده؟", "", ...lvl.topics.map((t) => `- ${t}`), ""].join("\n")
  await writeFile(
    path.join(DEST, `${lvl.slug}.md`),
    frontmatter({
      title: lvl.title,
      titleAr: lvl.title,
      subtitle: lvl.subtitle,
      order: lvl.order,
      status: "coming-soon",
    }) + body,
    "utf8",
  )
  console.log(`coming-soon ${lvl.slug}`)
}

console.log(`\n${(await readdir(DEST)).length} level files in ${DEST}`)
