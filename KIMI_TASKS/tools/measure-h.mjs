// Usage: node measure-h.mjs <prefix> [url]
// Phase H measurement suite. Measures the hero/landing metrics from
// KIMI_TASKS/phases/PHASE-H.md §0/T-H.11 at 5 viewports × 2 locales,
// saves JSON to KIMI_TASKS/reports/measure-h-<prefix>.json and
// viewport-only screenshots (for lime pixel counting) to
// KIMI_TASKS/reports/shots-phase-h/.
import puppeteer from "puppeteer-core"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const prefix = process.argv[2] || "before"
const url = process.argv[3] || "http://localhost:3100"
const TOOLS = path.dirname(fileURLToPath(import.meta.url))
const REPORTS = path.resolve(TOOLS, "../reports")
const SHOTS = path.join(REPORTS, "shots-phase-h")
mkdirSync(SHOTS, { recursive: true })

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const VIEWPORTS = [
  { w: 1280, h: 650 },
  { w: 375, h: 812 },
  { w: 1440, h: 900 },
  { w: 1382, h: 880 },
  { w: 768, h: 1024 },
]
const WRAP_WIDTHS = [320, 375, 768, 1280, 1920]
const LOCALES = ["ar", "en"]
const META_STRING = "المهارات اللي المسار بيغطيها"

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--disable-dev-shm-usage"],
})

const results = []

for (const vp of VIEWPORTS) {
  for (const lang of LOCALES) {
    const page = await browser.newPage()
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 })
    await page.evaluateOnNewDocument((l) => {
      try { localStorage.setItem("basma_lang", l) } catch (e) {}
    }, lang)
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 })
    await new Promise((r) => setTimeout(r, 2500))

    const m = await page.evaluate((META_STRING) => {
      const out = {}
      const vw = window.innerWidth, vh = window.innerHeight
      out.viewport = `${vw}x${vh}`
      out.dir = document.documentElement.dir

      // --- locate the skills strip (id after T-H.1, ul traversal before) ---
      const hero = document.querySelector("main section")
      const skillsUl = hero.querySelector("ul.grid")
      const strip = document.getElementById("skills-strip")
        || (skillsUl ? skillsUl.parentElement.parentElement : null)
      const stripRect = strip ? strip.getBoundingClientRect() : null

      // --- filled-primary probe: resolve var(--primary) the way the browser does ---
      const probe = document.createElement("div")
      probe.style.cssText = "position:absolute;top:-9999px;background:var(--primary)"
      document.body.appendChild(probe)
      const primaryColor = getComputedStyle(probe).backgroundColor
      probe.remove()
      const interactives = [...hero.querySelectorAll("a, button")]
      const isFilled = (el) => getComputedStyle(el).backgroundColor === primaryColor
      const primary = interactives.find(isFilled)
      const ctaRect = primary ? primary.getBoundingClientRect() : null

      out.ctaBottom = ctaRect ? Math.round(ctaRect.bottom * 100) / 100 : null
      out.stripTop = stripRect ? Math.round(stripRect.top * 100) / 100 : null
      // Overlap is measured against the LOWEST CTA in the hero (on mobile the
      // stacked column puts a second button below the primary one).
      const lowestCtaBottom = interactives.length
        ? Math.max(...interactives.map((el) => el.getBoundingClientRect().bottom))
        : null
      out.lowestCtaBottom = lowestCtaBottom != null ? Math.round(lowestCtaBottom * 100) / 100 : null
      out.overlapPx = (lowestCtaBottom != null && stripRect)
        ? Math.max(0, Math.round((lowestCtaBottom - stripRect.top) * 100) / 100)
        : null

      // --- lime block area as % of viewport ---
      const block = document.querySelector(".block-lime")
      if (block) {
        const r = block.getBoundingClientRect()
        out.limeBlockPct = Math.round(((r.width * r.height) / (vw * vh)) * 10000) / 100
      }

      // --- Arabic h1 ink box vs line box (two methods: canvas + DOM range) ---
      const arSpan = hero.querySelector("h1 span.text-foreground") || hero.querySelector("h1 span")
      if (arSpan) {
        const cs = getComputedStyle(arSpan)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const met = ctx.measureText(arSpan.textContent.trim())
        out.inkBoxCanvas = Math.round((met.actualBoundingBoxAscent + met.actualBoundingBoxDescent) * 100) / 100
        const range = document.createRange()
        range.selectNodeContents(arSpan)
        // Per LINE, not per span. The span wraps to two lines in the English
        // locale at 375px ("Your path to becoming an"), and comparing a
        // two-line bounding box against a one-line `line-height` reported a
        // 113.19-vs-57.2 "overflow" that isn't one. `getClientRects()` returns
        // one rect per line fragment, so dividing by that count restores the
        // measurement the acceptance criterion actually means.
        out.inkLines = range.getClientRects().length || 1
        out.inkBoxSpan = Math.round(range.getBoundingClientRect().height * 100) / 100
        out.inkBox = Math.round((out.inkBoxSpan / out.inkLines) * 100) / 100
        out.lineBox = parseFloat(cs.lineHeight)
        out.h1FontSize = cs.fontSize
      }

      // --- Latin span direction + one-line check ---
      const latin = hero.querySelector("h1 span.block-lime") || block
      if (latin) {
        out.latinDir = latin.dir || getComputedStyle(latin).direction
        out.latinLines = latin.getClientRects().length
        out.latinWraps = latin.scrollWidth > latin.clientWidth + 1
      }

      // --- .meta-ar Arabic width @ 11px: shipped stack vs plexArabic vs Arial ---
      const measureWidth = (fontFamily) => {
        const s = document.createElement("span")
        s.className = "meta-ar"
        s.textContent = META_STRING
        s.style.cssText = `position:absolute;top:-9999px;font-size:11px;white-space:nowrap;${fontFamily ? `font-family:${fontFamily};` : ""}`
        document.body.appendChild(s)
        const w = Math.round(s.getBoundingClientRect().width * 100) / 100
        s.remove()
        return w
      }
      out.metaAr = {
        shipped: measureWidth(null),
        plexArabic: measureWidth("var(--font-plex-arabic)"),
        arial: measureWidth("Arial"),
      }

      // --- touch targets < 44px (visible interactives, skip-link excluded) ---
      const els = [...document.querySelectorAll("a[href], button, [role=button], input")]
      const under = els.filter((el) => {
        const r = el.getBoundingClientRect()
        if (r.width <= 1 || r.height <= 1) return false // sr-only skip link
        if (el.getAttribute("aria-hidden") === "true") return false
        if (getComputedStyle(el).visibility === "hidden") return false
        return r.width < 44 || r.height < 44
      })
      out.touchUnder44 = under.length
      out.touchUnder44List = under.slice(0, 20).map((el) => {
        const r = el.getBoundingClientRect()
        return `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`
      })

      // --- horizontal overflow ---
      out.overflowX = document.documentElement.scrollWidth - vw

      // --- filled-primary interactive elements in first viewport ---
      out.filledPrimaryFirstScreen = [...document.querySelectorAll("a, button")]
        .filter((el) => {
          if (!isFilled(el)) return false
          const r = el.getBoundingClientRect()
          return r.bottom > 0 && r.top < vh && r.width > 1
        }).length

      // --- page length in screens ---
      out.pageScreens = Math.round((document.documentElement.scrollHeight / vh) * 100) / 100

      return out
    }, META_STRING)

    m.locale = lang
    results.push(m)

    // viewport-only screenshots for lime pixel counting (1280×650 + 375×812)
    if ((vp.w === 1280 && vp.h === 650) || (vp.w === 375 && vp.h === 812)) {
      const file = path.join(SHOTS, `${prefix}-${vp.w}x${vp.h}-${lang}.png`)
      await page.screenshot({ path: file, fullPage: false })
    }
    await page.close()
  }
}

// Latin one-line check across the full width range (AR locale)
for (const w of WRAP_WIDTHS) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: 800, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 })
  await new Promise((r) => setTimeout(r, 2000))
  const wrap = await page.evaluate(() => {
    const latin = document.querySelector("h1 .block-lime")
    if (!latin) return null
    return { lines: latin.getClientRects().length, wraps: latin.scrollWidth > latin.clientWidth + 1 }
  })
  const entry = results.find((r) => r.viewport === `${w}x800` && r.locale === "ar")
  if (entry) Object.assign(entry, wrap)
  else results.push({ viewport: `${w}x800`, locale: "ar", wrapOnly: true, ...wrap })
  await page.close()
}

await browser.close()

const outFile = path.join(REPORTS, `measure-h-${prefix}.json`)
writeFileSync(outFile, JSON.stringify(results, null, 2))
console.log(`saved ${outFile}`)
for (const r of results) {
  console.log(
    `${r.viewport} ${r.locale}`,
    r.wrapOnly ? `lines=${r.lines} wraps=${r.wraps}` :
    `overlap=${r.overlapPx} ctaBottom=${r.ctaBottom} lime=${r.limeBlockPct}% ink=${r.inkBox}/${r.lineBox} meta=${r.metaAr?.shipped}/${r.metaAr?.plexArabic} touch<44=${r.touchUnder44} ovr=${r.overflowX} filled=${r.filledPrimaryFirstScreen} screens=${r.pageScreens}`
  )
}
