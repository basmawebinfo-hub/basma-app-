"use client"

import { useI18n } from "@/lib/i18n"

export function Stats() {
  const { t } = useI18n()

  const stats = [
    { value: "200+", key: "stats.s1" },
    { value: "99.9%", key: "stats.s2" },
    { value: "<200ms", key: "stats.s3" },
  ]

  return (
    <section className="section-shell">
      <div className="container-site max-w-6xl">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-3">{stat.value}</p>
              <p className="text-sm text-muted-foreground max-w-50 mx-auto">{t(stat.key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
