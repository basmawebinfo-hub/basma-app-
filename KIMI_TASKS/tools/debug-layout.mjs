import puppeteer from "puppeteer-core"
import { pathToFileURL } from "node:url"
import path from "node:path"

const file = path.resolve(process.argv[2])
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--allow-file-access-from-files"],
})
const p = await browser.newPage()
await p.setViewport({ width: 1400, height: 900 })
await p.goto(pathToFileURL(file).href, { waitUntil: "networkidle0" })
await p.evaluate(() => document.fonts.ready)
await new Promise((r) => setTimeout(r, 300))
const info = await p.evaluate(() => {
  const bad = []
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.right > 1400.5 || r.left < -0.5) {
      bad.push({ tag: el.tagName, cls: el.className && String(el.className).slice(0, 40), left: Math.round(r.left), right: Math.round(r.right) })
    }
  })
  return { scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 20) }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
