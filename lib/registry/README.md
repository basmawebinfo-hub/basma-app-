# Service Registry

The Registry is Basma's runtime lookup for adapter instances. It answers
the question: "give me the current provider for domain X."

## Why it exists

Basma's core code depends on adapter interfaces (Layer 2), not concrete
providers (Layer 1). Someone has to decide which concrete provider is
wired to each interface at runtime. That's the Registry.

At startup, application code registers each active provider under its
domain name (`whatsapp`, `llm`, `workflow`). At runtime, other code
resolves by domain name and gets back the interface — never the concrete
class.

## Layer position

The Registry sits alongside Layer 2 adapters. It is not Layer 3 (that's
Capabilities, added when we ship them). It is not Layer 4 (application
code consumes the Registry, doesn't define it).

## Type safety

`ServiceName` is a closed union. Adding a new adapter domain requires
adding the name here — this is intentional. String-typed lookups are
forbidden because they lose type safety and drift silently.

## Usage (once providers land — not in this PR)

```typescript
// At startup, in a bootstrap file:
const registry = new ServiceRegistry()
registry.register("whatsapp", evolutionAdapter)
registry.register("llm", openAiAdapter)

// At runtime, in an API route or service:
const whatsapp = registry.resolve("whatsapp")
await whatsapp.sendText(sessionId, phone, message)
```

## What lives here today

- `registry.ts` — `IServiceRegistry` interface + `ServiceRegistry` class + `ServiceName` union

## Non-goals for this PR

- No workspace-scoped resolution (arrives with multi-workspace milestone)
- No feature-flag switching between providers (arrives with the first swap need)
- No provider health checks or discovery API (arrives with observability work)
