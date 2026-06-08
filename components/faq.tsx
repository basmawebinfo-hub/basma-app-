"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How quickly can I connect my WhatsApp number?",
    answer:
      "In under 30 seconds. Scan the QR code from your Basma Web dashboard, link your number via WhatsApp Linked Devices, and you start receiving messages immediately. No complex API setup required.",
  },
  {
    question: "Which automation tools does Basma Web support?",
    answer:
      "Basma Web forwards webhook events to any HTTP endpoint — including n8n, Zapier, Make, HubSpot, Slack, Google Sheets, and Airtable. If it accepts a POST request, it works with Basma Web.",
  },
  {
    question: "What types of WhatsApp events can I receive?",
    answer:
      "Basma Web supports 22 event types including incoming messages, message status updates, call events, contact changes, group updates, and more. You can subscribe to only the events you need.",
  },
  {
    question: "Does Basma Web support multiple WhatsApp numbers?",
    answer:
      "Yes. On the Pro plan you can connect up to 5 numbers, and on Enterprise there is no limit. Each number has its own inbox, webhook config, and analytics.",
  },
  {
    question: "How are webhook deliveries secured?",
    answer:
      "Pro and Enterprise plans support HMAC-SHA256 request signing. Each delivery includes a signature header so your endpoint can verify the payload came from Basma Web. Failed deliveries are automatically retried up to 3 times.",
  },
]

export function FAQ() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 lg:py-32 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-display mb-4">
            Frequently asked <span className="text-gradient-lime">questions</span>
          </h2>
          <p className="text-muted-foreground">Everything you need to know about Basma Web</p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card/30"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
