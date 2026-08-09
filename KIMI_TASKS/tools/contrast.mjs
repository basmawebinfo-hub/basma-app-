// OKLCH <-> sRGB conversion + WCAG contrast checker for the BASMA palette.
// Usage: node contrast.mjs  (prints brand conversion + full contrast table)

function srgbToLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
function linearToSrgb(c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055 }

function hexToOklch(hex) {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  const C = Math.sqrt(a * a + b2 * b2)
  let H = (Math.atan2(b2, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H }
}

function oklchToHex(L, C, H) {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad), b = C * Math.sin(hRad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b2 = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  const to255 = (v) => Math.round(Math.min(1, Math.max(0, linearToSrgb(v))) * 255)
  const gamutOk = [r, g, b2].every((v) => v >= -0.001 && v <= 1.001)
  return { hex: "#" + [r, g, b2].map((v) => to255(v).toString(16).padStart(2, "0")).join("").toUpperCase(), gamutOk }
}

function luminance(hex) {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255)
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255)
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(hex1, hex2) {
  const l1 = luminance(hex1), l2 = luminance(hex2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

// --- brand ---
const brand = hexToOklch("#ABE707")
console.log(`#ABE707 = oklch(${(brand.L).toFixed(3)} ${(brand.C).toFixed(3)} ${(brand.H).toFixed(1)})`)

// --- candidate tokens (oklch L C H) ---
const T = {
  background: [0.14, 0.006, 130],
  card: [0.17, 0.008, 130],
  elevated: [0.20, 0.009, 130],
  overlay: [0.24, 0.010, 130],
  foreground: [0.96, 0.005, 130],
  secondary: [0.82, 0.008, 130],
  mutedFg: [0.71, 0.010, 130],
  border: [0.26, 0.008, 130],
  borderStrong: [0.35, 0.010, 130],
  primary: [brand.L, brand.C, brand.H],
  primaryHover: [0.90, 0.20, brand.H],
  primaryActive: [brand.L - 0.06, brand.C - 0.02, brand.H],
  primaryFg: [0.17, 0.02, 130],
  primaryOnLight: [0.54, 0.135, brand.H],
  ring: [brand.L, brand.C, brand.H],
  success: [0.82, 0.15, 160],
  warning: [0.83, 0.15, 85],
  danger: [0.70, 0.18, 25],
  info: [0.80, 0.10, 245],
}

const hex = {}
for (const [k, [L, C, H]] of Object.entries(T)) {
  const { hex: h, gamutOk } = oklchToHex(L, C, H)
  hex[k] = h
  console.log(`${k.padEnd(14)} oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})  -> ${h}${gamutOk ? "" : "  ⚠ OUT OF GAMUT"}`)
}

console.log("\n--- contrast pairs ---")
const pairs = [
  ["foreground", "background", 4.5], ["foreground", "card", 4.5], ["foreground", "elevated", 4.5],
  ["secondary", "background", 4.5], ["secondary", "card", 4.5],
  ["mutedFg", "background", 4.5], ["mutedFg", "card", 4.5],
  ["primary", "background", 3.0], ["primary", "card", 3.0],
  ["primaryFg", "primary", 4.5], ["primaryFg", "primaryHover", 4.5],
  ["ring", "background", 3.0],
  ["border", "background", 1.2], ["borderStrong", "card", 1.6],
  ["success", "background", 4.5], ["warning", "background", 4.5],
  ["danger", "background", 4.5], ["info", "background", 4.5],
  ["success", "card", 4.5], ["warning", "card", 4.5], ["danger", "card", 4.5], ["info", "card", 4.5],
]
for (const [fg, bg, min] of pairs) {
  const c = contrast(hex[fg], hex[bg])
  console.log(`${fg}/${bg}`.padEnd(28) + c.toFixed(2).padStart(6) + `:1  (min ${min})  ${c >= min ? "PASS" : "❌ FAIL"}`)
}
// brand on white (known failure, documented)
console.log("\nbrand #ABE707 on #FFFFFF:", contrast("#ABE707", "#FFFFFF").toFixed(2), ":1 (expected FAIL — accent never used on light)")
console.log("primaryOnLight on #FFFFFF:", contrast(hex.primaryOnLight, "#FFFFFF").toFixed(2), ":1 (min 4.5 for light-surface accents)")
