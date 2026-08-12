"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LangToggle } from "@/components/lang-toggle"
import { whatsappLink } from "@/config/contact"
import { Menu, X, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/lib/i18n"

// Absolute anchors (`/#…`) because the navbar renders on /services too, where a
// bare fragment would resolve against the current page and go nowhere.
const navLinks = [
  { href: "/services", key: "nav.services" },
  { href: "/#faq", key: "nav.faq" },
  { href: "/#footer", key: "nav.contact" },
]

export function Navbar() {
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Close the mobile menu with Escape for keyboard users
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileMenuOpen])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="container-site max-w-6xl py-4" aria-label="Main navigation">
        <div className="flex h-14 items-center justify-between bg-background border border-border px-4 sm:px-6">
          <Link href="/" className="flex items-center min-h-11 shrink-0 me-6 lg:me-10" aria-label="Basma Web home">
            <Image src="/basma-logo.png" alt="BASMA" width={1005} height={280} priority className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation - hidden below lg */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Platform dropdown removed for clean landing nav */}

            {/* Dashboard dropdown removed */}

            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                /* min-h-6: these measured 20px tall, under WCAG 2.5.8 (AA)'s
                   24×24 floor. Phase B gave the footer links `sm:min-h-6` for
                   exactly this reason and the navbar was missed. */
                className="inline-flex items-center min-h-6 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons - hidden below lg */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Was `/#academy` — the highest-contrast control on the page
                pointing at a قريبًا section nobody can act on. It now opens the
                same conversation as the hero primary, with a different
                prefilled message so the owner can tell a navbar lead from a
                hero lead before reading it. min-h-11: this was a 32px target. */}
            {/* Outline, not filled. The first screen gets exactly one lime
                fill and the hero owns it — a navbar button competing at the
                same weight is what made the old page offer three equally loud
                next actions. */}
            <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap min-h-11" asChild>
              <a
                href={whatsappLink(t("wa.msg.nav"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("nav.getStarted")}
                <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </a>
            </Button>
            <div className="w-px h-5 bg-border/60 mx-1" />
            <LangToggle />
          </div>

          {/* Mobile Menu Button - visible below lg */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center min-h-11 min-w-11 -me-2 p-2 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu - visible below lg */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-0 left-0 w-dvw h-dvh bg-background z-40 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border/50">
                <Link href="/" className="flex items-center min-h-11 gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Image src="/basma-logo.png" alt="BASMA" width={1005} height={280} className="h-8 w-auto object-contain" />
                </Link>
                <button
                  type="button"
                  className="flex items-center justify-center min-h-11 min-w-11 p-2 text-foreground hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">
                {/* Nav Links Section */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-base text-muted-foreground hover:text-foreground transition-colors hover:bg-foreground/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-border/50 bg-background flex flex-col gap-3">
                <Button className="py-6 text-base w-full" asChild>
                  <a
                    href={whatsappLink(t("wa.msg.nav"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.getStarted")}
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}