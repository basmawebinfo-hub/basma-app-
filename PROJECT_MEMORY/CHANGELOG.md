# Changelog — BASMA AI Hardening Wave

All changes in this session are kept strictly local in accordance with instruction protocols.

---

## [2026-07-26]

### Fixed
* **`components/navbar.tsx`**: Fixed a critical mobile menu rendering bug where `{link.label}` was printed but the `navLinks` list contains `key` instead of `label`. Changed it to `{t(link.key)}`, fixing both the typescript compilation failure and the missing-text bug on mobile viewports.
* **`app/admin/users/page.tsx`**: Resolved typescript cast failure by casting type conversion safely.
* **`app/api/admin/stats/route.ts`**: Safely typed the database postgrest filter builder query object to resolve standard TS compiler mismatches.
* **`app/api/admin/users/route.ts`**: Corrected dynamic mapped tuple typings for subscriber data, adding missing `created_at` parameters to mapped entities.
* **`app/api/dashboard/stats/route.ts`**: Fixed relational list-to-single object cast error by safely casting joined entity lists to objects under TS check.
* **`app/api/wh/[token]/route.ts`**:
  * Fixed signature bypass vulnerability by enforcing that `x-evolution-signature` is strictly required and verified if active.
  * Resolved generic type casting error for rules by utilizing safe dynamic types.

### Added
* **`lib/security.ts`**: Implemented `isSafeUrl` function to shield server fetches from loopbacks, cloud metadata endpoints, and private network address spaces (SSRF protection).
* **`app/api/wh/[token]/route.ts` & `app/api/evolution/webhook/route.ts`**: Integrated the `isSafeUrl` validation on webhook delivery destinations to fully neutralize SSRF risk.
