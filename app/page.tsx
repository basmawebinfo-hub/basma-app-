import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Outcomes } from "@/components/outcomes"
import { AcademyTeaser } from "@/components/academy-teaser"
import { ServicesTeaser } from "@/components/services-teaser"
import { Proof } from "@/components/proof"
import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

/**
 * Sections built around the retired WhatsApp platform — the product video
 * gallery, the "200+ integrations / 99.9% uptime / 200ms" stats, the QR-scanning
 * how-it-works, and the WhatsApp pricing table — were removed in Phase E. They
 * described a product that no longer exists, and the figures were unevidenced.
 * A short honest page beats a long one that is half fiction.
 */
export default function Home() {
  return (
    <main id="main" className="relative z-0 min-h-screen bg-background overflow-x-hidden">
      {/* The corner field. Logical `end-0` + a dir-aware mask class, so it
          mirrors with the locale: in Arabic it bleeds off the top-left, in
          English off the top-right — always opposite the headline's entry
          point. Smaller and dimmer than Phase G shipped it: the lime budget
          for the whole first screen is 10% and the headline block owns most
          of it. */}
      <div
        className="corner-field absolute top-0 end-0 w-[720px] h-[400px] sm:h-[520px] -z-10 bg-primary/40 pointer-events-none"
      >
        <div className="absolute inset-0 bg-cover ltr:bg-right-top rtl:bg-left-top" style={{ backgroundImage: "url('/grade.png')" }} />
      </div>

      <Navbar />

      {/* One story, in order: what you'll be able to build → the roadmap that
          gets you there and how far along it actually is → the services beside
          it → why any of this is credible → the questions that remain → the
          ask. Outcomes come before the roadmap because a level list means
          nothing to someone who doesn't yet know what it's for. */}
      <Hero />
      <Outcomes />
      <AcademyTeaser />
      <ServicesTeaser />
      <Proof />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
