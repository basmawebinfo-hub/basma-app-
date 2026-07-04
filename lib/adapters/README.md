# Layer 2 — Adapter Interfaces

Adapter interfaces are the contracts between Basma's core code and any external
provider (WhatsApp gateways, LLMs, workflow engines, storage backends, etc.).

## The rule

**Basma's core code depends on interfaces, never on concrete providers.**

- `lib/adapters/{domain}/types.ts` — the interface (what Basma expects)
- `lib/adapters/{domain}/{provider}.ts` — a concrete provider implementation (added when needed)

Basma's application code (`app/api/*`, `app/dashboard/*`) never imports a
concrete provider file. It receives an interface via dependency injection or
looks one up through the Service Registry (`lib/registry/`).

## Layer position

This is Layer 2 in the 4-layer architecture (see `library/basma-whatsapp-platform/ARCHITECTURE.md` v1.1):

```
Layer 4: Platform surfaces (existing app code — untouched by this scaffolding)
Layer 3: Capabilities (added when needed)
Layer 2: Adapter interfaces (THIS FOLDER) + concrete provider implementations
Layer 1: Providers (Evolution, OpenAI, n8n, Chatwoot, ...)
```

## Adding a new adapter domain

1. Create `lib/adapters/{new-domain}/types.ts` with the interface only.
2. Do NOT ship placeholder methods. Every method must be used within the
   next milestone.
3. Interfaces are generic: they describe what any provider in that domain
   can do, not what one specific provider does.
4. Concrete implementations land in a separate PR — one per provider.
5. If the adapter needs to be discoverable at runtime, register it in
   `lib/registry/`.

## What lives here today

- `whatsapp/types.ts` — `IWhatsAppProvider`
- `llm/types.ts` — `ILLMProvider`
- `workflow/types.ts` — `IWorkflowEngine`

Other adapter domains (payment, storage, vector, events, conversation
backend, automation engine) are NOT scaffolded yet. They will be added
when their first concrete implementation is scheduled.

## Non-goals

- No provider SDK imports from this folder
- No business logic here — this is pure interface layer
- No re-exports of provider types
