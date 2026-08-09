// Usage: node snap.mjs <prefix> [url]
// Takes full-page screenshots of <url> at 1440/768/375 widths into
// KIMI_TASKS/reports/shots-phase-b/<prefix>-<width>.png
// Requires a running server at <url> (default http://localhost:3100).
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const prefix = process.argv[2] || "shot"
const url = process.argv[3] || "http://localhost:3100"
const lang = process.argv[4] || "" // e.g. "en" to force basma_lang before load
const TOOLS = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(TOOLS, "../reports/shots-phase-b")
mkdirSync(OUT, { recursive: true })

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const WIDTHS = [1440, 768, 375]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--disable-dev-shm-usage"],
})

for (const w of WIDTHS) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 })
  if (lang) {
    await page.evaluateOnNewDocument((l) => {
      try { localStorage.setItem("basma_lang", l) } catch (e) {}
    }, lang)
  }
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 })
  // let entrance animations settle
  await new Promise((r) => setTimeout(r, 2500))
  // scroll through the page once so lazy/whileInView content renders
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0
      const step = () => {
        y += 600
        window.scrollTo(0, y)
        if (y < document.body.scrollHeight) setTimeout(step, 60)
        else { window.scrollTo(0, 0); setTimeout(resolve, 400) }
      }
      step()
    })
  })
  const file = path.join(OUT, `${prefix}-${w}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`saved ${file}`)
  await page.close()
}

await browser.close()
