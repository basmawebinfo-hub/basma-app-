"use client"


const logos = [
  { name: "n8n", text: "n8n" },
  { name: "Zapier", text: "Zapier" },
  { name: "Make", text: "Make" },
  { name: "HubSpot", text: "HubSpot" },
  { name: "Airtable", text: "Airtable" },
  { name: "Notion", text: "Notion" },
  { name: "Slack", text: "Slack" },
]

export function LogoCloud() {

  return (
    <section className="section-strip" aria-label="Featured in">
      <div className="container-site max-w-6xl">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Integrates with the tools you already use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="text-lg font-semibold tracking-tight">{logo.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
