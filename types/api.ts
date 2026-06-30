/**
 * API request/response envelope types.
 *
 * Every /api/v1/* route handler should:
 *   - Accept { data: T } via Zod validation (see config/env.ts pattern).
 *   - Return ApiSuccess<R> on success, ApiError on failure.
 *
 * This makes client-side parsing a single function instead of N ad-hoc shapes.
 *
 * Source spec: SYSTEM_ARCHITECTURE.md §5.2
 */

/**
 * Stable error codes — clients check `error.code` to decide UX:
 *   - VALIDATION_FAILED → show field-level error
 *   - PERMISSION_DENIED → show "not allowed" toast
 *   - TIER_LIMIT        → trigger UpgradePrompt with requiredTier
 *   - QUOTA_EXCEEDED    → show usage badge + upgrade hint
 *   - NOT_FOUND         → router.push("/404")
 *   - RATE_LIMITED      → backoff
 *   - INTERNAL          → generic error toast
 */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "PERMISSION_DENIED"
  | "TIER_LIMIT"
  | "QUOTA_EXCEEDED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "INTERNAL"

export type ApiError = {
  error: {
    code: ApiErrorCode
    /** Human-readable Arabic message — safe to display directly to users. */
    message: string
    /** Optional structured details. NEVER shown to users in prod. */
    details?: Record<string, unknown>
  }
}

export type ApiSuccess<T> = {
  data: T
  meta?: ApiMeta
}

/**
 * Pagination + listing metadata.
 */
export type ApiMeta = {
  page?: number
  pageSize?: number
  total?: number
  hasMore?: boolean
}

/**
 * Discriminated union — the only thing a fetch() call returns.
 * Use:
 *   const res: ApiResponse<Plan[]> = await apiFetch(...)
 *   if ("error" in res) { showToast(res.error.message); return }
 *   // ✅ res.data is narrowed to Plan[]
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError

/**
 * Type guard.
 */
export function isApiError<T>(res: ApiResponse<T>): res is ApiError {
  return "error" in res
}
