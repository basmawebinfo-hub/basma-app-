import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { AcademyTeaser } from "@/components/academy-teaser"
import { ServicesTeaser } from "@/components/services-teaser"
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
      {/* The corner field. Was a soft radial fade — brutalism has no diffuse
          light source, so the mask now falls off hard and the whole thing is
          dimmed well below the headline's lime block. It reads as a printed
          halftone panel bleeding off the corner rather than as a glow. */}
      <div
        className="absolute top-0 right-0 w-[1100px] h-[900px] -z-10 bg-primary/70 pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(215deg, var(--mask-shade) 0%, var(--mask-shade) 38%, transparent 62%)",
        }}
      >
        <div className="absolute inset-0 bg-cover bg-right-top" style={{ backgroundImage: "url('/grade.png')" }} />
      </div>

      <Navbar />

      <Hero />
      <AcademyTeaser />
      <ServicesTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
