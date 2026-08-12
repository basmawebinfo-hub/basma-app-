"use client"

import { useI18n } from "@/lib/i18n"

/**
 * "What you'll be able to build" — the middle the page was missing.
 *
 * Between the headline and the ask there was nothing: no statement of who this
 * is for, and no outcome a visitor could weigh. This is that section.
 *
 * EVERY ITEM IS TRACEABLE to a level that is actually written in
 * `D:\Basma agancy\BasmaProgram`. The `levels` field is not decoration — it is
 * the citation, and it is rendered so a reader can check the claim against the
 * roadmap below. Sources, section-by-section:
 *
 *   1 → Level 01 (AI Problem Solver) §5 discovering the real problem inside a
 *       business, §6 breaking it down, §10 business problem → technical
 *       requirements, §11 mapping the process/workflow, §12 what can be automated
 *   2 → Level 02 (Python Fundamentals) §11 files, §12 JSON, §13 CSV,
 *       §20 sending/receiving data and calling APIs from Python
 *   3 → Level 03 (Developer Foundations) §1 terminal, §5 Git, §6 GitHub,
 *       §7–9 commits/branches/PRs, §10 .env, §12 reading error messages
 *   4 → Level 04 (Web, APIs & Webhooks) §8 REST APIs, §9 authentication,
 *       §10 webhooks, §11 webhook security, §14 rate limits, §15 pagination
 *
 * If a claim cannot be traced to a written level, it does not ship. Do not add
 * a fifth item to balance the grid — four written levels, four outcomes.
 */
const OUTCOMES = [
  { key: "outcomes.i1", levels: [1] },
  { key: "outcomes.i2", levels: [2] },
  { key: "outcomes.i3", levels: [3] },
  { key: "outcomes.i4", levels: [4] },
]

export function Outcomes() {
  const { t } = useI18n()

  return (
    <section id="outcomes" className="section-shell">
      <div className="container-site max-w-6xl">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            {t("outcomes.title1")} <span className="text-primary">{t("outcomes.title2")}</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t("outcomes.subtitle")}</p>
        </div>

        {/* Cells and rules, like the rest of the site — no icons in circles, no
            gradient cards. The border collapse is done by hand (start/top on
            the list, end/bottom on each cell) because `divide-*` can't close
            the grid on both axes when the row count changes at each breakpoint. */}
        {/* Four across at lg so the band reads as one row of the page's
            structure rather than a 2×2 block — it also keeps the section under
            half a screen on a 650px-tall laptop, where the page is longest. */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 border-s border-t border-border">
          {OUTCOMES.map(({ key, levels }) => (
            <li key={key} className="border-e border-b border-border p-6 sm:p-8">
              <p className="meta mb-3" dir="ltr">
                {levels.map((n) => `L${String(n).padStart(2, "0")}`).join(" ")}
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t(`${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
