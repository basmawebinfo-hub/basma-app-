/**
 * Workflow engine adapter interface.
 *
 * A workflow engine runs pre-defined automation workflows (identified by id)
 * and reports their execution status. This interface is intentionally generic
 * across providers:
 *
 *   - n8n (self-hosted, current provider)
 *   - Temporal
 *   - AWS Step Functions
 *   - any future provider that speaks the "run this workflow by id" model
 *
 * This is NOT the pipeline runtime Basma builds for itself — that's a
 * separate concept (Basma's Automation Engine) added when we ship it. This
 * interface is for wrapping external workflow providers.
 */

export type WorkflowId = string
export type ExecutionId = string

export type ExecutionStatus = "pending" | "running" | "success" | "failed" | "cancelled"

export interface ExecutionResult {
  status: ExecutionStatus
  /** Provider-shaped output; caller is responsible for interpreting it. */
  output?: unknown
  /** Error message when status is "failed". */
  error?: string
}

export interface IWorkflowEngine {
  /**
   * Trigger a named workflow with an optional input payload. Returns the
   * execution id, which the caller can use to poll status. Execution is
   * asynchronous — this method returns before the workflow finishes.
   */
  runWorkflow(id: WorkflowId, input?: unknown): Promise<ExecutionId>

  /**
   * Fetch the current status + output of a previously-started execution.
   * Callers poll or await via their own mechanism; this is a snapshot read.
   */
  getExecution(executionId: ExecutionId): Promise<ExecutionResult>
}
