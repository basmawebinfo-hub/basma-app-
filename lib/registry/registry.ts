/**
 * Service Registry — runtime lookup for adapter instances.
 *
 * See `README.md` in this folder for the design rationale.
 *
 * The Registry is deliberately minimal:
 *   - A closed `ServiceName` union keeps type safety.
 *   - Registration is explicit at startup.
 *   - Resolution throws if the requested service was never registered,
 *     making misconfigurations loud instead of silent.
 */

import type { IWhatsAppProvider } from "@/lib/adapters/whatsapp/types"
import type { ILLMProvider } from "@/lib/adapters/llm/types"
import type { IWorkflowEngine } from "@/lib/adapters/workflow/types"

/**
 * The closed set of adapter domains Basma supports today. Adding a new
 * adapter domain requires a new entry here — that's intentional so lookups
 * stay type-safe and can't drift.
 */
export type ServiceName = "whatsapp" | "llm" | "workflow"

/**
 * Maps each service name to its interface. This is what gives the Registry
 * its type-safe resolve() signature: `resolve("whatsapp")` returns
 * `IWhatsAppProvider`, `resolve("llm")` returns `ILLMProvider`, etc.
 */
export interface ServiceMap {
  whatsapp: IWhatsAppProvider
  llm: ILLMProvider
  workflow: IWorkflowEngine
}

export interface IServiceRegistry {
  register<N extends ServiceName>(name: N, service: ServiceMap[N]): void
  resolve<N extends ServiceName>(name: N): ServiceMap[N]
  list(): ServiceName[]
}

export class ServiceRegistry implements IServiceRegistry {
  private services = new Map<ServiceName, ServiceMap[ServiceName]>()

  register<N extends ServiceName>(name: N, service: ServiceMap[N]): void {
    this.services.set(name, service)
  }

  resolve<N extends ServiceName>(name: N): ServiceMap[N] {
    const svc = this.services.get(name)
    if (!svc) {
      throw new Error(`ServiceRegistry: no service registered for "${name}"`)
    }
    return svc as ServiceMap[N]
  }

  list(): ServiceName[] {
    return [...this.services.keys()]
  }
}
