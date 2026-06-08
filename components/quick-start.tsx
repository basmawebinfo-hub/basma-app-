"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const codeExamples = {
  Webhook: `# Configure your webhook endpoint
  curl -X POST https://api.basmaweb.com/v1/webhooks \\
    -H "Authorization: Bearer YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
      "name": "My n8n Workflow",
      "url": "https://my-n8n.io/webhook/abc123",
      "events": ["MESSAGE_RECEIVED", "MESSAGE_STATUS"]
    }'

# List active webhooks
  curl https://api.basmaweb.com/v1/webhooks \\
    -H "Authorization: Bearer YOUR_API_KEY"`,
  "Send Message": `# Send a WhatsApp message
  curl -X POST https://api.basmaweb.com/v1/messages \\
    -H "Authorization: Bearer YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
      "instanceId": "INSTANCE_ID",
      "to": "+20123456789",
      "text": "Hello from Basma Web!"
    }'`,
  JavaScript: `// Verify incoming webhook signature
  import crypto from 'crypto';

  function verifySignature(payload, signature, secret) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expected === signature;
  }

  // Handle incoming message
  app.post('/webhook', (req, res) => {
    const sig = req.headers['x-basma-signature'];
    if (!verifySignature(req.rawBody, sig, process.env.WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    const { event, data } = req.body;
    console.log('Received event:', event, data);
    res.status(200).json({ ok: true });
  });`,
  Python: `import hmac, hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

# Flask webhook handler
@app.route('/webhook', methods=['POST'])
def webhook():
    sig = request.headers.get('X-Basma-Signature', '')
    if not verify_signature(request.get_data(), sig, WEBHOOK_SECRET):
        return jsonify(error='Invalid signature'), 401
    event = request.json
    print(f"Event: {event['event']} from {event['data']['pushName']}")
    return jsonify(ok=True)`,
}

const tabs = Object.keys(codeExamples) as (keyof typeof codeExamples)[]

export function QuickStart() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("CLI")
  const [copied, setCopied] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderCodeLine = (line: string, index: number) => {
    const trimmedLine = line.trimStart()
    const indent = line.length - trimmedLine.length
    const indentSpaces = " ".repeat(indent)

    if (trimmedLine.startsWith("#")) {
      return (
        <div key={index} className="whitespace-pre">
          <span className="text-foreground">{trimmedLine}</span>
        </div>
      )
    }

    return (
      <div key={index} className="whitespace-pre">
        <span className="text-primary">
          {indentSpaces}
          {trimmedLine}
        </span>
      </div>
    )
  }

  return (
    <section id="inbox" className="relative py-16 sm:py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl overflow-hidden border border-primary/30 bg-black shadow-[0_0_30px_rgba(217,249,157,0.1)]"
        >
          <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-primary/15 border-b border-primary/20">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500" />
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-yellow-500" />
              <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-primary" />
            </div>
            <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-foreground tracking-wider uppercase">
              API Reference
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 sm:px-6 py-3 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                size="sm"
                variant={activeTab === tab ? "default" : "secondary"}
                rounded="lg"
                className="uppercase tracking-wide text-[10px] sm:text-xs flex-shrink-0"
              >
                {tab}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              className="ml-auto flex-shrink-0"
              aria-label="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="p-3 sm:p-6 overflow-x-auto">
            <pre className="text-xs sm:text-sm font-mono leading-loose">
              <code>{codeExamples[activeTab].split("\n").map((line, i) => renderCodeLine(line, i))}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
