"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Lang = "ar" | "en"

// Translation dictionary. Add keys as we translate each section.
export const translations: Record<string, { ar: string; en: string }> = {
  // ══════════════════════════════════════════════════════════════════════════
  // BASMA is an academy first, an agency second.
  //
  // Every string that described the retired WhatsApp automation platform was
  // removed in Phase E — including the "200+ integrations", "99.9% uptime" and
  // "200ms webhook latency" figures, which were claims about a product that no
  // longer exists.
  //
  // RULE: nothing here may state a number, a credential, or an outcome the
  // business cannot evidence today. No student counts, no success rates, no
  // testimonials. When in doubt, describe what we do, not how well it went.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Navigation ────────────────────────────────────────────────────────────
  "nav.academy":        { ar: "الأكاديمية", en: "Academy" },
  "nav.services":       { ar: "الخدمات", en: "Services" },
  "nav.faq":            { ar: "الأسئلة الشائعة", en: "FAQ" },
  "nav.contact":        { ar: "تواصل معنا", en: "Contact" },
  "nav.getStarted":     { ar: "ابدأ دلوقتي", en: "Start now" },

  // ── Hero ──────────────────────────────────────────────────────────────────
  // hero.desc is capped at 25 words per locale (Phase H, T-H.4). The old copy
  // ran 40 words in Arabic and 62 in English and spent its second sentence on
  // services, which have their own track further down the page. Say who it's
  // for and what they'll be able to do — then stop.
  "hero.badge":         { ar: "أكاديمية وخدمات ذكاء اصطناعي بالعربي", en: "Arabic-first AI academy and services" },
  "hero.title1":        { ar: "طريقك تبقى", en: "Your path to becoming an" },
  "hero.title2":        { ar: "AI Automation Engineer", en: "AI Automation Engineer" },
  "hero.desc":          { ar: "مسار بالعربي من الصفر لأي حد مالوش خلفية برمجية: تتعلّم تحلّل المشكلة، تبنيها بالكود والأدوات، وتوصّلها بالذكاء الاصطناعي.", en: "An Arabic roadmap from zero for people with no coding background: analyse the problem, build it with code and tools, then wire AI in." },
  // The honest state of the roadmap, stated where the ask is made. {done} and
  // {total} are interpolated from config/roadmap.ts — never typed in here.
  "hero.state":         { ar: "{done} مستويات مكتوبة من {total} — والباقي بيتكتب دلوقتي.", en: "{done} of {total} levels written — the rest are being written now." },
  // Deliberately NOT "كلّمنا على واتساب" — that is cta.join, the closing button
  // at the bottom of the page. The hero opens the pitch and the final CTA
  // closes it; the same words on both makes the page feel like it restarted.
  "hero.ctaTalk":       { ar: "اسألنا عن المسار", en: "Ask us about the roadmap" },
  "hero.ctaAcademy":    { ar: "شوف المسار", en: "See the roadmap" },
  "hero.ctaServices":   { ar: "الخدمات", en: "Services" },
  "hero.skills":        { ar: "المهارات اللي المسار بيغطيها", en: "What the roadmap covers" },

  // ── Outcomes — "what you'll be able to build" ──────────────────────────────
  // Phase H, T-H.8. Every item is traceable to a level that is ACTUALLY
  // WRITTEN in D:\Basma agancy\BasmaProgram — the source sections are cited in
  // components/outcomes.tsx. If a claim can't be traced to a written level, it
  // does not ship. Do not add a fifth item to balance a grid.
  "outcomes.title1":    { ar: "بعد المسار", en: "After the roadmap" },
  "outcomes.title2":    { ar: "هتقدر تعمل إيه", en: "you'll be able to" },
  "outcomes.subtitle":  { ar: "مش وعود عامة — دي مخرجات المستويات المكتوبة فعلًا.", en: "Not general promises — these are the outcomes of the levels that are actually written." },
  "outcomes.i1.title":  { ar: "تحوّل مشكلة شغل لمتطلبات تقنية", en: "Turn a business problem into technical requirements" },
  "outcomes.i1.body":   { ar: "تكتشف المشكلة الحقيقية جوه أي بيزنس، تقسّمها لأجزاء، وترسم الـ workflow وتحدد إيه اللي ينفع يتأتمت — قبل ما تكتب سطر كود.", en: "Find the real problem inside a business, break it into parts, map the workflow, and decide what can actually be automated — before writing a line of code." },
  "outcomes.i2.title":  { ar: "تبني بالكود، مش بس تستخدم أدوات جاهزة", en: "Build with code, not just wire up tools" },
  "outcomes.i2.body":   { ar: "Python من الأساسيات: بيانات، ملفات، JSON و CSV، والتعامل مع الـ APIs بنفسك بدل ما تستنى أداة تعملها لك.", en: "Python from the basics: data, files, JSON and CSV, and calling APIs yourself instead of waiting for a tool to do it for you." },
  "outcomes.i3.title":  { ar: "تشتغل زي أي developer", en: "Work like a developer" },
  "outcomes.i3.body":   { ar: "الـ terminal، وGit وGitHub، وتنظيم المشروع، والـ‎ .env، وتقرا رسالة الخطأ وتفهمها بدل ما تخاف منها.", en: "The terminal, Git and GitHub, project structure, .env files, and reading an error message instead of fearing it." },
  "outcomes.i4.title":  { ar: "توصّل نظامين ببعض", en: "Make two systems talk to each other" },
  "outcomes.i4.body":   { ar: "REST APIs والـ authentication، والـ webhooks وتأمينها، والتعامل مع rate limits وpagination والأخطاء.", en: "REST APIs and authentication, webhooks and how to secure them, and handling rate limits, pagination, and errors." },

  // ── Proof ─────────────────────────────────────────────────────────────────
  // Phase H, T-H.9. HARD RULE, restating the file header: every line here maps
  // to something that exists in this repo or in KIMI_TASKS/STATUS.md. No
  // student counts, no testimonials, no ratings, no partner logos, no
  // percentages. If the owner later supplies a founder bio it goes here — do
  // not write one for him.
  "proof.title1":       { ar: "ليه", en: "Why" },
  "proof.title2":       { ar: "تصدّقنا", en: "trust this" },
  "proof.i1.title":     { ar: "المسار مكتوب، مش موعود", en: "The roadmap is written, not promised" },
  "proof.i1.body":      { ar: "{done} مستويات كاملة من {total}، كل واحد فيه شرح مبسّط ومثال عملي ومصادر وأسئلة تقييم.", en: "{done} complete levels of {total}, each with a plain-language explanation, a worked example, references, and assessment questions." },
  "proof.i2.title":     { ar: "في خدمة شغالة دلوقتي", en: "One service is live today" },
  "proof.i2.body":      { ar: "خدمة الاشتراكات موجودة بصفحتها، بشروطها وسعرها معلنين — مش «كلّمنا نتفق».", en: "The subscriptions service has its own page with its terms and its fee published — not \"message us and we'll see\"." },
  "proof.i3.title":     { ar: "بنرد بنفسنا", en: "You reach a person" },
  "proof.i3.body":      { ar: "واتساب على رقم حقيقي. مفيش فورم ولا تذكرة ولا بوت بيرد بدل حد.", en: "WhatsApp on a real number. No form, no ticket queue, no bot answering on someone's behalf." },
  "proof.i4.title":     { ar: "بنقول الحالة زي ما هي", en: "We tell you the actual state" },
  "proof.i4.body":      { ar: "المستوى اللي لسه مكتبش بنقول عليه، والرقم اللي لسه مش متحدد بنقول إنه مش متحدد.", en: "A level that isn't written says so. A number that isn't decided says it isn't decided." },

  // ── Academy ───────────────────────────────────────────────────────────────
  "academy.title1":     { ar: "مسار", en: "The" },
  "academy.title2":     { ar: "AI Automation Engineer", en: "AI Automation Engineer roadmap" },
  "academy.subtitle":   { ar: "١٤ مستوى متدرّج بالعربي. كل مستوى فيه شرح مبسّط، مثال عملي، مصادر، وأسئلة تقييم — عشان تتأكد إنك فهمت قبل ما تكمّل.", en: "14 progressive levels in Arabic. Each has a plain-language explanation, a worked example, references, and assessment questions — so you can check you understood before moving on." },
  "academy.l1":         { ar: "AI Problem Solver — تتعلّم تفكّر قبل ما تبني", en: "AI Problem Solver — think before you build" },
  "academy.l2":         { ar: "Python Fundamentals — أساسيات البرمجة", en: "Python Fundamentals — programming basics" },
  "academy.l3":         { ar: "Developer Foundations — أدوات المطوّر", en: "Developer Foundations — the developer toolkit" },
  "academy.l4":         { ar: "Web APIs & Webhooks — إزاي الأنظمة بتتكلم مع بعض", en: "Web APIs & Webhooks — how systems talk to each other" },
  "academy.remaining":  { ar: "{n} مستويات جاية — بنكتبها ونضيفها أول بأول", en: "{n} more levels on the way — we publish them as they're written" },
  "academy.ctaNote":    { ar: "المسار لسه بيتجهّز. كلّمنا لو عايز تعرف أول ما يفتح.", en: "The roadmap is being prepared. Message us to hear when it opens." },
  "academy.cta":        { ar: "اعرف أول ما يفتح", en: "Tell me when it opens" },
  "academy.open":       { ar: "ادخل المسار", en: "Open the roadmap" },

  // ── Academy pages ─────────────────────────────────────────────────────────
  "academyPage.title":  { ar: "الأكاديمية", en: "Academy" },
  "academyPage.subtitle": { ar: "مسارات تعليمية بالعربي في الأتمتة والذكاء الاصطناعي. كل مستوى فيه شرح وأمثلة ومصادر وأسئلة تقييم.", en: "Arabic learning paths in automation and AI. Every level has explanations, worked examples, references, and assessment questions." },
  "academyPage.empty":  { ar: "مفيش مسارات منشورة لسه.", en: "No courses published yet." },
  "academyPage.count":  { ar: "{published} من {total} مستوى متاحين دلوقتي", en: "{published} of {total} levels available now" },
  "academyPage.open":   { ar: "ابدأ المسار", en: "Start the roadmap" },

  "academy.progress":   { ar: "تقدّمك", en: "Your progress" },
  "academy.markComplete": { ar: "علّم إنك خلّصت المستوى", en: "Mark level complete" },
  "academy.completed":  { ar: "خلّصت المستوى ده", en: "Level completed" },
  "academy.soon":       { ar: "قريبًا", en: "Soon" },
  "academy.levelN":     { ar: "المستوى {n}", en: "Level {n}" },
  "academy.videoSoon":  { ar: "الفيديو لسه مترفعش. المحتوى المكتوب تحت كامل وتقدر تذاكر منه دلوقتي.", en: "The video isn't uploaded yet. The written content below is complete and ready to study." },
  "academy.videoError": { ar: "مش قادرين نحمّل الفيديو ده. راجع الرابط أو كلّمنا.", en: "We couldn't load this video. Check the link or message us." },
  "academy.levelSoon":  { ar: "المستوى ده لسه بيتكتب. تحت هتلاقي المواضيع اللي هيغطيها.", en: "This level is still being written. Below is what it will cover." },
  "academy.notifyBody": { ar: "عايز تعرف أول ما المستوى ده ينزل؟", en: "Want to know when this level goes live?" },
  "academy.prev":       { ar: "المستوى السابق", en: "Previous level" },
  "academy.next":       { ar: "المستوى التالي", en: "Next level" },
  "academy.levelNav":   { ar: "التنقل بين المستويات", en: "Level navigation" },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  "faq.title1":         { ar: "الأسئلة", en: "Frequently asked" },
  "faq.title2":         { ar: "الشائعة", en: "questions" },
  "faq.subtitle":       { ar: "كل اللي محتاج تعرفه عن بصمة", en: "What you need to know about BASMA" },
  "faq.q1":             { ar: "المسار ده لمين؟", en: "Who is the roadmap for?" },
  "faq.a1":             { ar: "لأي حد عايز يشتغل في الأتمتة والذكاء الاصطناعي ومش عارف يبدأ منين. مش محتاج خلفية برمجية — المستوى الأول بيبدأ من طريقة التفكير نفسها، والبرمجة بتيجي بعدها بالتدريج.", en: "Anyone who wants to work in automation and AI and doesn't know where to start. No programming background needed — level one starts with how to think about the problem, and code comes gradually after that." },
  "faq.q2":             { ar: "المحتوى بالعربي ولا الإنجليزي؟", en: "Is the content in Arabic or English?" },
  "faq.a2":             { ar: "الشرح كله بالعربي. المصطلحات التقنية بتفضل بالإنجليزي زي ما هي، عشان لما تدوّر عليها أو تشتغل في الشغل الحقيقي تلاقيها بنفس الاسم.", en: "The explanations are all in Arabic. Technical terms stay in English as they are, so that when you search for them or work professionally you find them under the same name." },
  "faq.q3":             { ar: "المسار خلص ولا لسه؟", en: "Is the roadmap finished?" },
  "faq.a3":             { ar: "لسه بيتبني. أربع مستويات مكتوبين من أصل ١٤، وبنضيف الباقي أول بأول. مش هنقولك إنه جاهز وهو مش جاهز.", en: "Not yet. Four of the 14 levels are written, and we add the rest as they're finished. We won't tell you it's ready when it isn't." },
  "faq.q4":             { ar: "إيه علاقة الخدمات بالأكاديمية؟", en: "How do the services relate to the academy?" },
  "faq.a4":             { ar: "الخدمات بتحل مشاكل عملية بتقابل أي حد بيتعلّم أو بيشتغل في المجال ده في مصر — أولها إنك تقدر تشترك في أدوات الذكاء الاصطناعي والكورسات من غير كارت دولي.", en: "The services solve practical problems anyone learning or working in this field in Egypt runs into — starting with being able to subscribe to AI tools and courses without an international card." },
  "faq.q5":             { ar: "أتواصل معاكم إزاي؟", en: "How do I get in touch?" },
  "faq.a5":             { ar: "على واتساب مباشرة. في أزرار في الصفحة بتفتحلك المحادثة على طول.", en: "On WhatsApp directly. The buttons on this page open the conversation straight away." },

  // ── Final CTA ─────────────────────────────────────────────────────────────
  "cta.title1":         { ar: "ابدأ من النهاردة.", en: "Start today." },
  "cta.title2":         { ar: "السؤال الأول مجاني.", en: "The first question is free." },
  "cta.subtitle":       { ar: "سواء عايز تتعلّم أو محتاج خدمة — كلّمنا على واتساب وهنرد عليك.", en: "Whether you want to learn or you need a service — message us on WhatsApp and we'll get back to you." },
  "cta.join":           { ar: "كلّمنا على واتساب", en: "Message us on WhatsApp" },
  "cta.services":       { ar: "شوف الخدمات", en: "See services" },

  // ── Footer ────────────────────────────────────────────────────────────────
  "footer.tagline":     { ar: "أكاديمية وخدمات ذكاء اصطناعي بالعربي.", en: "Arabic-first AI academy and services." },
  "footer.product":     { ar: "بصمة", en: "BASMA" },
  "footer.company":     { ar: "الشركة", en: "Company" },
  "footer.legal":       { ar: "قانوني", en: "Legal" },
  "footer.academy":     { ar: "الأكاديمية", en: "Academy" },
  "footer.about":       { ar: "عن بصمة", en: "About" },
  "footer.contact":     { ar: "تواصل معنا", en: "Contact" },
  "footer.faq":         { ar: "الأسئلة الشائعة", en: "FAQ" },
  "footer.privacy":     { ar: "الخصوصية", en: "Privacy" },
  "footer.terms":       { ar: "الشروط", en: "Terms" },
  "footer.rights":      { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },

  // ── Language toggle ───────────────────────────────────────────────────────
  "lang.switch":        { ar: "English", en: "العربية" },

  // ══════════════════════════════════════════════════════════════════════════
  // SERVICES
  //
  // COPY CONSTRAINT — read before editing anything below.
  // This service pays for the customer's OWN subscription on their behalf.
  // It does NOT sell, resell, or share accounts. Never write "we sell you an
  // account", "shared account", or anything implying the account is ours.
  // The account belongs to the customer, on their email, and they keep their
  // own password. Most AI providers ban resale and shared access — accounts
  // that look resold get terminated and the customer loses access and money.
  // ══════════════════════════════════════════════════════════════════════════
  "services.title":     { ar: "خدمات بصمة", en: "BASMA services" },
  "services.subtitle":  { ar: "حلول عملية لمشاكل بتقابل أي حد بيشتغل بالذكاء الاصطناعي في المنطقة العربية.", en: "Practical solutions to problems anyone working with AI in the Arab region runs into." },
  "services.more":      { ar: "بنضيف خدمات جديدة أول بأول.", en: "We add new services as they launch." },
  "services.viewOne":   { ar: "اعرف التفاصيل", en: "See details" },

  "svc.ai.title":       { ar: "اشتراكات الذكاء الاصطناعي والكورسات", en: "AI & course subscriptions" },
  "svc.ai.tagline":     { ar: "عايز تشترك في أداة ذكاء اصطناعي أو كورس ومعندكش كارت بيشتغل بره مصر؟ إحنا بندفعهولك.", en: "Want an AI tool or an online course but your card doesn't work internationally? We pay for it for you." },

  "svc.ai.problemTitle":{ ar: "المشكلة", en: "The problem" },
  "svc.ai.problemBody": { ar: "بتلاقي الأداة اللي محتاجها، وتوصل لصفحة الدفع، وتقف. الكارت المصري مش بيعدّي، والاشتراك محتاج فيزا دولية أو حساب بره. فتفضل مستني، أو تدوّر على بدائل أضعف.", en: "You find the tool you need, reach the payment page, and stop. Local cards get declined, and the subscription needs an international card or a foreign account. So you wait, or settle for something weaker." },

  "svc.ai.solutionTitle": { ar: "الحل", en: "What we do" },
  "svc.ai.solutionBody":  { ar: "إحنا بندفع الاشتراك نيابةً عنك — على حسابك إنت، بإيميلك إنت. إنت بتدفعلنا محليًا بالجنيه، وإحنا بنكمّل عملية الدفع للمزوّد. الحساب بيفضل ملكك من أول لحظة، وكلمة السر تفضل معاك إنت لوحدك.", en: "We pay the subscription on your behalf — on your own account, with your own email. You pay us locally in EGP and we complete the payment with the provider. The account is yours from the start, and your password stays with you alone." },

  "svc.ai.stepsTitle":  { ar: "بيحصل إزاي", en: "How it works" },
  "svc.ai.step1.t":     { ar: "قولنا إنت عايز إيه", en: "Tell us what you want" },
  "svc.ai.step1.d":     { ar: "اسم الأداة أو الكورس، والباقة اللي محتاجها.", en: "The tool or course, and which plan you need." },
  "svc.ai.step2.t":     { ar: "بنأكدلك التكلفة", en: "We confirm the cost" },
  "svc.ai.step2.d":     { ar: "بنحسبلك السعر بالجنيه المصري ونقولك بالظبط داخل فيه إيه قبل ما تدفع حاجة.", en: "We work out the price in EGP and tell you exactly what's included before you pay anything." },
  "svc.ai.step3.t":     { ar: "بتدفع محليًا", en: "You pay locally" },
  "svc.ai.step3.d":     { ar: "فودافون كاش، أي محفظة إلكترونية، أو تحويل بنكي.", en: "Vodafone Cash, any e-wallet, or a bank transfer." },
  "svc.ai.step4.t":     { ar: "بنكمّل الاشتراك", en: "We complete the subscription" },
  "svc.ai.step4.d":     { ar: "بندفع للمزوّد على حسابك، والاشتراك بيتفعّل باسمك.", en: "We pay the provider on your account, and the subscription activates in your name." },
  "svc.ai.step5.t":     { ar: "بيشتغل عندك", en: "It's live" },
  "svc.ai.step5.d":     { ar: "بنبعتلك تأكيد، وتدخل على حسابك عادي وتستخدمه.", en: "We send you confirmation, you sign in to your account and use it." },

  "svc.ai.payTitle":    { ar: "طرق الدفع", en: "Payment methods" },
  "svc.ai.payWallet":   { ar: "فودافون كاش وباقي المحافظ الإلكترونية", en: "Vodafone Cash and other e-wallets" },
  "svc.ai.payBank":     { ar: "تحويل بنكي", en: "Bank transfer" },
  "svc.ai.payNote":     { ar: "بنبعتلك بيانات الدفع في المحادثة بعد ما نتفق على التفاصيل.", en: "We send payment details in the conversation once the details are agreed." },

  "svc.ai.coversTitle": { ar: "بنغطّي إيه", en: "What we cover" },
  "svc.ai.coversBody":  { ar: "أدوات الذكاء الاصطناعي، الكورسات الأونلاين، والاشتراكات الرقمية بشكل عام. لو مش متأكد إن اللي إنت عايزه ينفع، اسألنا.", en: "AI tools, online courses, and digital subscriptions generally. If you're not sure whether what you want is covered, just ask." },

  "svc.ai.termsTitle":  { ar: "التكلفة والمدة", en: "Cost and timing" },
  "svc.ai.feeLabel":    { ar: "رسوم الخدمة", en: "Service fee" },
  "svc.ai.timeLabel":   { ar: "مدة التنفيذ", en: "Turnaround" },
  "svc.ai.termsAsk":    { ar: "بنتفق عليها في المحادثة حسب الأداة والباقة", en: "Agreed in the conversation, depending on the tool and plan" },

  "svc.ai.faqTitle":    { ar: "أسئلة شائعة", en: "Common questions" },
  "svc.ai.faq1.q":      { ar: "الحساب هيبقى بتاعي فعلاً؟", en: "Is the account really mine?" },
  "svc.ai.faq1.a":      { ar: "أيوة. الحساب بيتعمل بإيميلك إنت وبيفضل ملكك. إحنا بندفع بس — مش بنبيع ولا بنشارك حسابات.", en: "Yes. The account is created with your email and stays yours. We only handle the payment — we don't sell or share accounts." },
  "svc.ai.faq2.q":      { ar: "هتشوفوا كلمة السر بتاعتي؟", en: "Will you see my password?" },
  "svc.ai.faq2.a":      { ar: "لأ. كلمة السر تفضل معاك إنت لوحدك.", en: "No. Your password stays with you alone." },
  "svc.ai.faq3.q":      { ar: "لو الاشتراك ما اتمّش؟", en: "What if the subscription doesn't go through?" },
  "svc.ai.faq3.a":      { ar: "لو ما قدرناش نكمّل العملية لأي سبب، بنرجّعلك فلوسك. بنقولك السبب بصراحة قبل أي حاجة.", en: "If we can't complete it for any reason, we refund you. We tell you the reason openly first." },
  "svc.ai.faq4.q":      { ar: "بتقبلوا أي عملة؟", en: "Which currencies do you accept?" },
  "svc.ai.faq4.a":      { ar: "بنستقبل بالجنيه المصري، وبنحسبلك التكلفة على أساس سعر الصرف وقت الدفع.", en: "We take Egyptian pounds, and calculate the cost using the exchange rate at the time of payment." },

  "svc.ai.ctaTitle":    { ar: "محتاج تشترك في حاجة؟", en: "Need help subscribing?" },
  "svc.ai.ctaBody":     { ar: "ابعتلنا على واتساب وقولنا إنت عايز إيه، وهنرد عليك بالتكلفة والتفاصيل.", en: "Message us on WhatsApp and tell us what you need — we'll reply with the cost and details." },
  "svc.ai.cta":         { ar: "كلّمنا على واتساب", en: "Message us on WhatsApp" },

  // Prefilled WhatsApp messages — different per entry point so an incoming
  // enquiry says where the lead came from.
  "wa.msg.services":    { ar: "السلام عليكم، شفت صفحة الخدمات على موقع بصمة وعايز أستفسر.", en: "Hi, I saw the services page on the BASMA site and I'd like to ask about it." },
  "wa.msg.aiService":   { ar: "السلام عليكم، عايز أستفسر عن خدمة الاشتراك في أدوات الذكاء الاصطناعي.", en: "Hi, I'd like to ask about the AI subscription service." },
  "wa.msg.academy":     { ar: "السلام عليكم، عايز أعرف أول ما مسار AI Automation Engineer يفتح.", en: "Hi, I'd like to know when the AI Automation Engineer roadmap opens." },
  "wa.msg.footer":      { ar: "السلام عليكم، عايز أستفسر عن بصمة.", en: "Hi, I'd like to ask about BASMA." },
  // Distinct from wa.msg.academy and from each other: the owner should be able
  // to tell a hero lead from a navbar lead before reading the message.
  "wa.msg.hero":        { ar: "السلام عليكم، جاي من الصفحة الرئيسية وعايز أعرف أول ما المسار يفتح.", en: "Hi, I'm coming from the home page and I'd like to know when the roadmap opens." },
  "wa.msg.nav":         { ar: "السلام عليكم، عايز أبدأ مع بصمة — أعمل إيه؟", en: "Hi, I'd like to get started with BASMA — what's the first step?" },
  "wa.msg.item":        { ar: "السلام عليكم، عايز أشترك في {item}.", en: "Hi, I'd like to subscribe to {item}." },

  // ── Price breakdown ───────────────────────────────────────────────────────
  // Showing the split is the strongest conversion argument available: it makes
  // the service fee read as $5 rather than as the whole difference from list.
  "price.list":         { ar: "سعر الاشتراك", en: "Subscription price" },
  "price.vat":          { ar: "ضريبة القيمة المضافة ١٤٪", en: "VAT 14%" },
  "price.fee":          { ar: "رسوم الخدمة", en: "Service fee" },
  "price.total":        { ar: "الإجمالي", en: "Total" },
  "price.egp":          { ar: "جنيه — بسعر الصرف اليوم، بيتأكد وقت الطلب", en: "EGP — at today's rate, confirmed when you order" },
  "price.cta":          { ar: "اطلبه على واتساب", en: "Order on WhatsApp" },
  "price.title":        { ar: "الأدوات والأسعار", en: "Tools and prices" },
  "price.subtitle":     { ar: "الأسعار بالدولار عشان ما تتأثرش بتغيّر سعر الصرف. المبلغ بالجنيه بيتأكد وقت الطلب.", en: "Prices are in USD so they don't move with the exchange rate. The EGP amount is confirmed when you order." },
  "price.more":         { ar: "عايز أداة مش موجودة هنا؟ أي حاجة بتتدفع أونلاين بالكارت بنعملها — كلّمنا.", en: "Need something that isn't listed? Anything payable online by card, we can do — just ask." },
  "wa.label":           { ar: "واتساب", en: "WhatsApp" },

  // ── Home-page services teaser ─────────────────────────────────────────────
  "home.svc.title1":    { ar: "خدمات", en: "What we" },
  "home.svc.title2":    { ar: "بصمة", en: "do for you" },
  "home.svc.subtitle":  { ar: "أول خدمة متاحة دلوقتي — وبنضيف غيرها قريب.", en: "The first service is live — more are on the way." },
  "home.svc.cta":       { ar: "كل الخدمات", en: "All services" },
}

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const Ctx = createContext<I18nCtx>({ lang: "ar", setLang: () => {}, t: (k) => k })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar")

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("basma_lang")) as Lang | null
    if (saved === "ar" || saved === "en") setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  const setLang = (l: Lang) => { setLangState(l); if (typeof window !== "undefined") localStorage.setItem("basma_lang", l) }
  const t = (key: string) => translations[key]?.[lang] ?? key

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n() { return useContext(Ctx) }
