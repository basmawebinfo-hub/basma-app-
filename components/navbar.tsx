"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LangToggle } from "@/components/lang-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  Webhook,
  BarChart3,
  Plug,
  Zap,
  Lock,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/lib/i18n"

const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#inbox", label: "Inbox" },
  { href: "#webhooks", label: "Webhooks" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
]

const platformItems = [
  { href: "/dashboard/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/dashboard/connect", label: "Connections", icon: Plug },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const toolsMenu = {
  free: [
    {
      category: "Messaging",
      items: [
        { href: "#inbox", label: "Unified Inbox", icon: MessageSquare },
        { href: "#integrations", label: "Integrations", icon: Plug },
      ],
    },
    {
      category: "Analytics",
      items: [
        { href: "#platform", label: "Analytics Dashboard", icon: BarChart3 },
      ],
    },
  ],
  paid: [
    {
      category: "Automation",
      items: [
        { href: "#webhooks", label: "Webhook Engine", icon: Webhook },
        { href: "#webhooks", label: "Auto-Retry", icon: Zap },
      ],
    },
    {
      category: "Enterprise",
      items: [
        { href: "#pricing", label: "HMAC Signing", icon: Lock },
        { href: "#pricing", label: "Guaranteed SLA", icon: Settings },
      ],
    },
  ],
}

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-6xl px-2 sm:px-4 lg:px-8 py-4" aria-label="Main navigation">
        <div className="flex h-14 items-center justify-between bg-background/60 backdrop-blur-xl border border-border/50 rounded-full px-4 sm:px-6">
          <Link href="/" className="flex items-center" aria-label="Basma Web home">
            <img src="/basma-logo.png" alt="BASMA" className="h-9 sm:h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation - hidden below lg */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Platform Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
                Platform
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[480px] max-w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-xl border-border p-4"
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Free Tools Column */}
                  <div>
                    <DropdownMenuLabel className="flex items-center gap-2 text-primary font-semibold mb-2">
                      Free Tools
                    </DropdownMenuLabel>
                    {toolsMenu.free.map((cat) => (
                      <div key={cat.category} className="mb-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">
                          {cat.category}
                        </div>
                        {cat.items.map((item) => (
                          <DropdownMenuItem key={item.href} asChild className="group">
                            <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                              <item.icon
                                className="w-4 h-4 text-primary group-data-[highlighted]:text-black transition-colors"
                                aria-hidden="true"
                              />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </div>
                  {/* Paid Tools Column */}
                  <div>
                    <DropdownMenuLabel className="flex items-center gap-2 text-primary font-semibold mb-2">
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      Pro Tools
                    </DropdownMenuLabel>
                    {toolsMenu.paid.map((cat) => (
                      <div key={cat.category} className="mb-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 px-2">
                          {cat.category}
                        </div>
                        {cat.items.map((item) => (
                          <DropdownMenuItem key={item.href} asChild className="group">
                            <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                              <item.icon
                                className="w-4 h-4 text-primary group-data-[highlighted]:text-black transition-colors"
                                aria-hidden="true"
                              />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dashboard Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
                Dashboard
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-border">
                {platformItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild className="group">
                    <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                      <item.icon
                        className="w-4 h-4 text-primary group-data-[highlighted]:text-black transition-colors"
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons - hidden below lg */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Button variant="ghost" size="sm" rounded="full" asChild>
              <Link href="/dashboard">{t("nav.login")}</Link>
            </Button>
            <Button size="sm" rounded="full" className="gap-1.5" asChild>
              <Link href="#pricing">
                {t("nav.getStarted")}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <div className="w-px h-5 bg-border/60 mx-1" />
            <LangToggle />
          </div>

          {/* Mobile Menu Button - visible below lg */}
          <button
            type="button"
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
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
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span
                    className="font-[family-name:var(--font-pt-mono)] font-bold text-base text-foreground"
                    style={{ letterSpacing: "-0.05em" }}
                  >
                    BASMA
                  </span>
                </Link>
                <button
                  type="button"
                  className="p-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">
                {/* Platform Section */}
                <div className="px-4 py-2 text-xs font-medium text-primary uppercase tracking-wider">Platform</div>
                {platformItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-2 px-4 py-3 text-base text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className="w-5 h-5 text-primary group-hover:text-black transition-colors"
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border/50 my-3" />
                {/* Nav Links Section */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-base text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-border/50 bg-background flex flex-col gap-3">
                <Button variant="ghost" rounded="lg" className="justify-center text-base py-6 w-full" asChild>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </Button>
                <Button rounded="full" className="py-6 text-base w-full" asChild>
                  <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}