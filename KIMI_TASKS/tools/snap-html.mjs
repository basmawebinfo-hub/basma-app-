// snap-html.mjs <html-file> <out.png> — screenshot a local HTML file headlessly
import puppeteer from "puppeteer-core"
import path from "node:path"
import { pathToFileURL } from "node:url"

const file = path.resolve(process.argv[2])
const out = path.resolve(process.argv[3])

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=1"],
})
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle0", timeout: 60000 })
await page.evaluate(() => document.fonts.ready)
await new Promise((r) => setTimeout(r, 400))
const dims = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  innerW: window.innerWidth,
}))
console.log("dims", JSON.stringify(dims))
if (dims.scrollW > dims.innerW) {
  await page.setViewport({ width: dims.scrollW, height: 900, deviceScaleFactor: 1 })
  await new Promise((r) => setTimeout(r, 200))
}
await page.screenshot({ path: out, fullPage: true })
console.log("saved", out)
await browser.close()
