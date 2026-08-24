# PAWS Launch-Hardening — Execution Report (in progress)

**Repo:** `pup-connect-finds` · **Branch:** `main` · **Baseline:** `37706d9` · **Supabase:** `wneticxjhxpjpfghnclr`

This document is the durable checkpoint for the multi-session launch-hardening run. It is updated at the end of each session.

---

## Session 1 — Authentication, Authorization & IDOR — ✅ COMPLETE

**Objective:** make PAWS safe against unauthenticated access and cross-user (IDOR) access. Server-authoritative identity everywhere: the acting user is always the verified session (`req.user.id`), never a client-supplied body/query/param `userId`.

### Root-cause fix
- Added `server/middleware/ownership.ts` — reusable server-side authorization primitives:
  - `requireOwner(kind, param)` — loads the resource (`listing`/`post`/`comment`) server-side and enforces ownership (401 anon / 404 missing / 403 not-owner; admins bypass).
  - `requireSelf(getTargetId)` — a `:userId`-style param must equal the session user (admins bypass).
  - `requireAuthed` / `isAdmin` helpers.
- Added `storage.isConversationParticipant(convId, userId)` — checks the participants join table **and** legacy buyer/seller columns; used to gate all message reads/sends.

### Vulnerabilities closed (all verified by tests)
| Route(s) | Before | After |
|---|---|---|
| `POST/PUT/DELETE /api/listings[/:id]`, `/:id/restore` | unauth, client `user_id` | `requireAuth` + `requireOwner('listing')`; owner forced from session |
| `PATCH/DELETE /api/posts/:id`, `/:id/restore` | unauth | `requireAuth` + `requireOwner('post')` |
| `PATCH/DELETE /api/comments/:id` | unauth | `requireAuth` + `requireOwner('comment')` |
| `POST /api/messages` | client `sender_id` spoofable | `requireAuth`; `sender_id` forced from session; participant check |
| `POST /api/messaging/messages`, `.../mark-read`, `GET .../:id/messages`, `GET /api/conversations/:id/messages` | no participant check | participant check via `isConversationParticipant` |
| `GET /api/conversations/:userId` | unauth | `requireAuth` + `requireSelf` |
| `GET/POST/DELETE /api/favorites[...]` | unauth, foreign `userId` | `requireAuth` + `requireSelf`; `user_id` forced from session |
| `GET /api/export-data` | **unauth PII export via `?userId=`** | `requireAuth`; identity from session only |
| `DELETE /api/delete-account` (inline fallback) | body `userId` | `requireAuth`; session identity (canonical handler is the password-verified GDPR one) |
| `POST /api/payout/{start,link,status,verify,dashboard-link}` | unauth, `body/query userId` hijack | `requireAuth` + handlers derive identity from session **only** (removed all `?? body.userId ?? query.userId`) |
| `POST /api/payouts/release` | **unauth Stripe transfers** | `requireAdminOrCron` (admin session or `CRON_SECRET`), fail-closed |
| `POST /create-connect-account`, `GET /stripe/account-status/:acctId/:userId` | root-mounted, client `userId` | `authMiddleware` + `requireAuth`; identity from session; account-ownership check |
| `POST /api/payments/{create-payment-intent,create-subscription,cancel-subscription,create-subscription-checkout}` | unauth / client `userId` | `requireAuth`; identity from session; cancel verifies subscription ownership |
| `GET /api/payments/{history,subscription-status}/:userId` | unauth | `requireAuth` + `requireSelf` |
| `GET /api/payments/intent/:id` (router) | any authed user reads any PI | ownership check via PI `metadata.user_id` |
| `POST /api/payments/{create-intent,confirm-intent}` (router) | permissive `authMiddleware` only | `requireAuth` added |
| `POST /api/provider-applications/review`, `PATCH /:id`, `GET /`, `GET /:id` | **unauth provider approval / signed ID-doc exposure** | `requireAdmin` |
| `POST /api/provider-applications/submit` | body `userId` | `requireAuth`; applicant from session |
| `POST /api/providers/id/{webhook,link-media}` | **self-driveable mock verification** | disabled in production (mock vendor) |
| `GET /api/qa/bug-reports`, `PATCH /bug-report/:id` | **unauth PII leak** | `authMiddleware` at mount + `requireAdmin` |
| `POST /api/qa/bug-report` | client `user_id` | `requireAuth`; reporter from session |
| `GET /api/admin/logs` (inline) | client `query.userId` admin id | `requireAuth` + `requireAdmin` |
| `POST /api/marketplace/bulk-update` | client `user_id` | `requireAuth`; ownership from session |
| `POST /api/reviews`, `/api/comment-replies`, `/api/transactions`, `/api/conversations` | client owner id | `requireAuth`; owner forced from session |
| `GET /api/transactions/:id` | unauth | `requireAuth` + ownership (user/buyer/seller) |
| `POST /api/ai/image-analysis` | unauth (API-cost abuse) | `requireAuth` |

### Tests added
`tests/session1-authz.test.ts` — 17 tests, all passing. Boots a minimal Express app wiring the **real** middleware (`requireAuth`, `requireOwner`, `requireSelf`, `requireAdmin`) + the hardened `startPayout`, DB mocked. Covers: anonymous mutation→401 (listing/export/delete/payout), owner vs non-owner vs admin vs missing (403/200/200/404), export identity server-derived, favorites foreign-userId→403, payout ignores body `userId`, provider review/admin-logs require admin.

### Validation
- `npx vitest run` → 18/18 pass (17 new + 1 pre-existing).
- `npx tsc --noEmit` → clean.
- `eslint` (changed files) → 0 errors (pre-existing style warnings only).

### Remaining (deferred to later sessions, not Session 1)
- Client-authoritative payment **amounts** (`create-payment-intent`, `create-intent`) → Session 4 (server-side price resolution).
- Supabase RLS / public storage buckets / `profiles` self-escalation → Session 2.
- Split-brain listing pipeline consolidation → Session 3.

---

## Session 2 — Supabase / RLS / Privacy / Storage — ✅ COMPLETE

**Objective:** prevent direct database/storage access (browser anon key + Postgres) from bypassing the Express authorization added in Session 1.

### Code changes (take effect on next deploy / bucket-ensure)
- `server/lib/ensureStorageBucket.ts` — `provider-id-docs` bucket now created/updated with **`public: false`** (was `true`). Government-ID docs are no longer world-readable.
- `server/routes/upload-id.ts` — `/front` and `/back` now return a **short-lived signed URL** (`createSignedUrl`, 1h) plus the canonical `path`, instead of a permanent `getPublicUrl`. Added a `signIdDoc()` helper. (The provider-application detail view already re-signs from `path` on read.)
- `client/src/integrations/supabase/client.ts` — **fail closed in production**: extracted `resolveSupabaseConfig()`; a production build with missing `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` now throws instead of silently using the demo project `https://abcdefghijklmnop.supabase.co`. Dev fallback preserved.
- Server Supabase env (`serverSupabaseEnv.ts`) already fails closed (returns null client → 503); no demo fallback existed there.

### Migration authored (forward-only, idempotent) — `supabase/migrations/20260824000000_rls_storage_privacy_hardening.sql`
1. `storage.buckets.public = false` for `provider-id-docs` and `message-attachments`; drop the "Anyone can view …" public SELECT policies; add owner-scoped SELECT policies.
2. `profiles` self-escalation closed: `REVOKE UPDATE (is_admin, verified, role, is_suspended, two_factor_secret, two_factor_enabled, backup_codes)` from `anon, authenticated` (column-level). Plus a `BEFORE UPDATE` trigger that blocks privileged-field changes unless `auth.role() = 'service_role'`.
3. `profiles` 2FA secret exposure closed: `REVOKE SELECT (two_factor_secret, backup_codes)` from `anon, authenticated`.
4. Guarded tightening of `subscription_analytics` / `donations` / `promotions` `USING(true)` policies (only if the tables exist).
   Includes inline verification SQL.

### Tests added
`tests/session2-supabase-failclosed.test.ts` — 5 tests: prod throws on missing URL/key, prod uses real values, dev falls back, real env never yields the demo project. All passing.

### 🔶 OWNER ACTION REQUIRED
- **Apply `20260824000000_rls_storage_privacy_hardening.sql` to production** (`wneticxjhxpjpfghnclr`) via Supabase SQL editor/CLI, then run the verification queries embedded in the file. Agents do not run remote migrations.
- **LIVE RLS VERIFICATION** for crown-jewel tables the browser reads directly with the anon key (RLS is the only guard, and repo migrations have diverged from prod — posture must be checked live). Tables and check:
  `payment_methods`, `escrow_transactions`, `verification_documents`, `verification_requests`, `background_checks`, `user_encryption_keys`, `security_events`, `professional_account_requests`, `payment_plans`.
  For each run:
  ```sql
  SELECT relname, relrowsecurity FROM pg_class WHERE relname = '<table>';           -- relrowsecurity must be true
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='<table>'; -- no USING(true); no unrestricted WITH CHECK(true)
  ```
  Any table with `relrowsecurity=false` or a `USING(true)`/`WITH CHECK(true)` policy is a live data-exposure blocker and must be fixed before beta.
- **Confirm the production build sets `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`** (the client now hard-fails without them — intended, but the deploy env must provide them).

### Remaining (deferred)
- Server-side reads that still trust stored *public* URLs for ID docs will regenerate signed URLs from `path` (already implemented in the app); confirm no code stores the now-signed `url` as a permanent reference (audit-level, low risk).

## Session 3 — Data Architecture & Listing Pipeline — ✅ COMPLETE

**Chosen source of truth:** the **server (Express → Drizzle → Postgres)**. All privileged listing mutations now route through the server API (which enforces ownership from Session 1), and the primary explore/search feed already reads from the same server (`/api/listings`).

### Split-brain resolved (code)
- `client/src/hooks/useDogListings.ts` — `createListing` / `updateListing` / `deleteListing` converted from **browser→Supabase direct writes** to `apiRequest('/api/listings', …)` (POST/PUT/DELETE). Server derives owner, enforces ownership, soft-deletes.
- `client/src/hooks/useCreateListing.ts` — same conversion (used by `CreateListingDialog`).
- No fake-success fallback: `apiRequest` throws on non-2xx → the existing error toasts fire. No silent localStorage/demo writes for listings (none existed).

### Lost & Found — DECISION: **WIRED** (was substantially present but unmounted)
The three routers (`lost-pet-alerts.ts` 865 lines, `search-missions.ts`, `lost-dog-ndis.ts`) were fully implemented, auth-safe (every mutation rejects anonymous and derives `user_id` from the session; PATCH enforces ownership with a field allowlist; graceful degradation if tables are missing) and backed by real migrations (`migrations/20260319_lost_pet_alerts_create.sql` + 7 more) and schema tables — but **never mounted**, so the fully-wired client dead-ended on 404s.
- Mounted `/api/lost-pet-alerts`, `/api/search-missions`, `/api/lost-dog` in `server/routes.ts`.
- Hardened `lost-dog-ndis.ts` `match-chip` with a missing `!userId` guard (it used `req.user.id` unguarded).

### Tests added
`tests/session3-listing-pipeline.test.ts` — 8 tests: anonymous create→401, owner create derives `user_id` (ignores spoofed body `user_id`), retrieve, owner edit, cross-user edit→403, spoofed `user_id` on edit does not transfer ownership, cross-user delete→403, owner soft-delete then 404 on read. All passing (suite total 31).

### Validation
- `npx vitest run` → 31/31 pass · `npx tsc --noEmit` → clean · eslint → 0 errors.

### 🔶 OWNER ACTION REQUIRED
- **Confirm the server `DATABASE_URL` (or `NEON_DATABASE_URL`) points at the SAME Postgres as the browser's Supabase project** (`wneticxjhxpjpfghnclr`). With writes now flowing server→Postgres and the feed reading server→Postgres, a single database makes create/read fully consistent. If the server currently points at a *separate* Neon instance, set `DATABASE_URL` to the Supabase Postgres connection string (Project Settings → Database) so there is one physical source of truth.
- **Confirm the `lost_pet_alerts*` tables exist in that production database** (they have migrations under `migrations/`; if the prod DB is the diverged Supabase one, apply the lost-pet migrations there). Until then the wired endpoints degrade gracefully to empty results.

### Note (brand — handled in Session 6)
`lost-dog-ndis.ts` `/share` falls back to `https://mypup.com` when `APP_URL` is unset — a stale "My Pup" brand default; flagged for Session 6.

## Session 4 — Stripe / Payments / Revenue Safety — ✅ COMPLETE

**Canonical webhook:** `server/routes/stripe/webhook.ts` (`/api/stripe/webhook`) — mandatory signature verification + durable DB idempotency (`withDbIdempotency`) + comprehensive event handling. The two legacy handlers were hardened to the same standard (not unmounted, since the live Stripe dashboard endpoint URL is owner-configured and unknown here).

### Vulnerabilities closed
- **Fake-success webhook** (`server/routes/webhook.ts`): removed the `if (!endpointSecret) { event = req.body }` skip-verification branch. Signature verification is now mandatory; missing secret → **503 fail-closed**. Uses raw body + mode-aware `STRIPE_WEBHOOK_SECRET`.
- **Soft-success webhook** (`server/routes/stripe/webhook.ts`): missing Stripe/secret now returns **503 in production** instead of a 200 "received" that silently dropped real events.
- **Inline handler** (`/api/webhooks/stripe`, `/api/payments/webhook`): now uses the mode-aware config secret and **503 fail-closed** if unset.
- **`sk_test_mock_key` fallback** (`server/lib/stripeLazy.ts`): production now **throws** if no usable secret key instead of silently using the mock key (which made charges no-op while the UI could report success). Dev keeps the placeholder.
- **Client-controlled amounts** (`POST /api/payments/create-payment-intent`): amount is now resolved **server-side** from `server/lib/paymentCatalog.ts` (env-configured prices per `productType`); a client `amount` is ignored, and an unknown/unpriced product **fails closed** (400 `PRODUCT_NOT_PRICED`).
- **Stripe mode misresolution** (`server/lib/config.ts`): mode now resolves from `STRIPE_MODE` → `NODE_ENV=production` → legacy `NEXT_PUBLIC_APP_ENV`/`VERCEL_ENV` (fixes Railway/Render defaulting to TEST keys). Added `validateStripeKeyMode()` (live/test mismatch, mock-key, cross-mode pub/secret) run on boot in `server/index.ts` (logs problems, never key material).
- **Forgeable verification** (`supabase/functions/user-verification/index.ts`): `update_verification_status` (sets `profiles.verified=true` via service role) and `get_verification_requests` now require `assertAdmin()`; previously any authenticated user could self-approve.

### Not-reachable (verified, no action needed)
- `PaymentIntegration` / `EscrowPaymentFlow` / `EnhancedPaymentSystem` simulated-success components are **dead code** (unimported). `StripeCheckoutDemo` in `StoreTab` is hard-disabled (`&& false`) and hits a real endpoint. Flagged for optional removal in Session 5.

### Tests added
- `tests/session4-payments.test.ts` (9): price catalog is server-authoritative (unknown/unconfigured → null; configured price ignores client amount; rejects malformed); key/mode validation (test-in-prod, cross-mode, mock-key, clean pass, NODE_ENV=production resolves prod).
- `tests/session4-webhook-verify.test.ts` (3): missing secret → 503; bad signature → 400; unsigned never 200.
- Suite total: **43 passing**. typecheck clean, eslint 0 errors.

### 🔶 OWNER ACTION REQUIRED
- **Stripe dashboard:** point the production webhook endpoint at the canonical `/api/stripe/webhook` (durable idempotency). Set `STRIPE_WEBHOOK_SECRET` (or `_LIVE`) accordingly.
- **Set `STRIPE_MODE=live`** (or ensure `NODE_ENV=production`) on the production host, plus `STRIPE_SECRET_KEY_LIVE` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE`. Boot log will report any mode/key mismatch.
- **Configure one-time prices** used by `create-payment-intent`: `REHOMING_FEATURE_PRICE_CENTS`, `PUP_BOX_PRICE_CENTS`, `LISTING_BOOST_PRICE_CENTS` (unset ⇒ that product fails closed).
- **Supabase edge functions:** the payment/verification edge functions (`stripe-payment`, `create-escrow-payment`, `user-verification`, etc.) are a separate deployment. Redeploy `user-verification` with the admin guard, and audit/redeploy or retire the other client-amount edge functions (`stripe-payment`) before enabling real payments — the Express server is the authoritative payment backend.
- If the beta will **not** take real money, keep Stripe in test mode (the safest default).

## Session 5 — Production Safety / Mocks / Admin / Observability — ✅ COMPLETE

### Diagnostics protected
- `/api/ops/supabase`, `/api/ops/config`, `/api/ops/database`, `/api/health/detailed` now require `opsGuard` (authenticated admin **or** matching `OPS_SECRET` header). Previously public — leaked DB host, env-var presence, and infra topology. `/api/health` + `/api/health/live` stay public (minimal safe status).

### Admin architecture
- **Removed hardcoded admin allowlist** in `server/routes/logs.ts` (`danieluke97`, `Royalbabybullz` username/email bypass) — admin is now `user.is_admin === true` only (trusted DB state).
- **Scoped moderator vs admin**: added `requireStrictAdmin` (full admins only, excludes moderators) in `server/middleware/requireAdmin.ts`. Applied it to the trust/privilege-granting provider-verification endpoints (`/review`, `PATCH /:id`) — minting "verified" providers is no longer a moderator power. General admin/moderation surfaces keep `requireAdmin` (admin + moderator).

### Logging / PII
- `server/middleware/loggingMiddleware.ts`: request debug log now **redacts** the `Authorization`/`cookie`/`apikey`/ops/cron secret headers and sensitive body fields (`password`, `token`, `secret`, `card`, `cvc`, `ssn`, `two_factor*`, `id_document`, bank fields).
- Response-body logging: **never logs bodies in production**; in development skips PII/sensitive paths (messaging, export-data, profiles, auth, payments, payouts, stripe, verify, upload-id, provider-applications). Previously a denylist of only 3 paths → private messages / profile PII were being logged.

### Demo/test routes
- Gated `/fraud-demo` and `/rate-limit-demo` to `import.meta.env.DEV` (were reachable in production). Other `*TestPage` routes were already DEV-stripped. Confirmed dev/seed endpoints are `NODE_ENV==='production'`-gated; `fraudDemo.ts`/`sentry-test.ts` remain unmounted.
- Dead simulated-success payment components (`PaymentIntegration`/`EscrowPaymentFlow`/`EnhancedPaymentSystem`) confirmed unimported; `StripeCheckoutDemo` hard-disabled.

### Observability
- Sentry is wired (`initializeSentry()` at boot + `Sentry.expressErrorHandler()` when `SENTRY_DSN` set). Health/liveness endpoints present.

### Tests added
`tests/session5-production-safety.test.ts` (7): header/body redaction; opsGuard rejects anon + non-admin (403), allows admin + ops-secret (200); liveness stays public. Suite total **50 passing**. typecheck clean, eslint 0 errors.

### 🔶 OWNER ACTION REQUIRED
- Set `OPS_SECRET` on the production host (so ops can read diagnostics when the DB/auth path is degraded).
- Set `SENTRY_DSN` in production to activate error monitoring.
- Confirm the intended **moderator scope** (product decision): currently moderators retain `requireAdmin` access to content-moderation and application list/detail views, but not to provider verification. Adjust if moderators should have more/less.

## Session 6 — Email / Legal / Brand — ✅ COMPLETE

### Brand consistency (single canonical identity: **PAWS**)
- Added `shared/brand.ts` (canonical `BRAND` constant: name **PAWS**, full "Pet Adoption Web Services", domain `petadoptionwebservices.com`, support/from defaults, **empty `legalEntity`** — never fabricated) and `server/lib/brand.ts` (`getBrand()` applies env overrides: `SUPPORT_EMAIL`, `FROM_EMAIL`/`SENDGRID_FROM`, `LEGAL_ENTITY_NAME`, `PUBLIC_APP_URL`/`APP_URL`).
- **Eliminated all user-visible "My Pup" / "MY PUP" (was 128 refs → 0)** and **all `mypup.com` (→ `petadoptionwebservices.com`)** across the client. High-value surfaces (Terms, Contact, LegalBlurb, auth screens, 2FA issuer) route through `BRAND`; static legal/help copy uses the canonical literal "PAWS". Internal identifiers left intact (`mypup-cart` localStorage key, `mypup-v1` cache names, `mypup_cache`) — renaming those would orphan users' data.
- Server: 2FA issuer, `[Pup Connect]` ops-alert subject, and `lost-dog` share/User-Agent fallbacks now use `BRAND`.

### Email
- No fake-success on the Express path: `sendEmail.ts` / `EmailService` already return `false` when SendGrid is unconfigured; updated their `from` addresses + all "MY PUP" templates to `BRAND`.
- **Fixed the fake-success edge function** `send-notification-email`: was returning `{success:true, id:'mock-email-id'}` while sending nothing. Now actually calls SendGrid when configured and returns **502 + `email_error`** when it can't send (no more silent success).

### Contact / support
- `Contact.tsx` support address now comes from `BRAND.supportEmail` (was `support@paws.app` placeholder). Legal/privacy/support emails now use the canonical domain.

### Tests added
`tests/session6-brand.test.ts` (5): canonical name is PAWS, legal entity never fabricated, contact defaults use the real domain (no example.com/paws.app/mypup), server resolver honors env overrides and falls back cleanly. Suite total **55 passing**. typecheck clean, eslint 0 errors.

### 🔶 OWNER ACTION REQUIRED
- Set `SUPPORT_EMAIL`, `FROM_EMAIL` (verified SendGrid sender), `LEGAL_ENTITY_NAME` (once the entity is decided), and `PUBLIC_APP_URL` in production.
- **DNS / sender verification** (SPF/DKIM for the transactional domain) — dashboard action.
- Replace the placeholder legal *text* (Terms/Privacy/Community Guidelines bodies) with final approved copy; the branding/identity in them is now consistent, but the clauses are still templated.
- Supabase auth email templates (confirmation/reset) are configured in the Supabase dashboard — update their branding there.

## Session 7 — Closed Beta Release Gate — ✅ COMPLETE

### Automated validation (all green)
| Gate | Result |
|---|---|
| Unit + authorization tests | **55 / 55 PASS** (`vitest`) |
| Typecheck (`tsc --noEmit`) | **PASS** |
| Lint (`eslint`, full tree) | **PASS** — 0 errors (1114 pre-existing style warnings) |
| Production build (`vite build` + `esbuild`) | **PASS** — client bundle + `dist/index.js` (860 kB) |
| Playwright E2E (9 specs) | **NOT RUN here** — see below |

### Regression repaired (surfaced by Session 3)
Mounting the Lost & Found routers pulled `server/lib/aiMatchQualityMonitor.ts` into the server bundle, exposing a **pre-existing baseline breakage**: it (and `admin-ai-match-quality.ts`) imported `aiMatchQualityEvents` / `aiMatchQualityDailyMetrics` / `aiMatchQualityAlerts` from `@shared/schema`, but those Drizzle definitions were never added (the file is `@ts-nocheck`, so `tsc` never caught it; the tables DO exist via `migrations/20260331_ai_match_quality_monitoring.sql`). Added the three missing table definitions to `shared/schema.ts` (columns matched exactly to the migration). The production build now passes.

### E2E — why not run here (safety)
The Playwright config starts the app via `npm run dev:3000` against the local `.env`, whose `DATABASE_URL`/Supabase point at the **real project** (`wneticxjhxpjpfghnclr`). The specs sign up users and create listings/messages — running them here would write to (and pollute) production data, which the safety rules forbid. E2E must run in CI against a dedicated test database with Playwright browsers installed. Existing coverage is solid: `critical-create-post`, `critical-messaging`, `critical-notifications`, `critical-provider-onboarding`, `lost-and-found`, `booking-modal-flow`, `master-flow`.

### Closed-beta data safety — verified in code
- IDs private (Session 2 storage + signed URLs), PII protected (Session 1 auth + Session 5 log redaction), user A cannot reach user B's data (Session 1 IDOR closure + tests), no anonymous mutation endpoints (Session 1), payments fail-closed and can stay test-mode (Session 4), demo/test tools DEV-gated (Session 5), production config fails closed (Session 2/4).
- **The DB/RLS/env pieces that can only be verified live remain OWNER ACTIONS** (Sessions 2–6) and are the gating items before inviting testers.

---

# PAWS Launch-Hardening — FINAL REPORT

**Automated validation:** unit/authz **55/55**, typecheck **PASS**, lint **PASS (0 err)**, build **PASS**, E2E **deferred to CI (data-safety)**.

**Tests added this run:** 54 new tests across 6 files (`session1-authz`, `session2-supabase-failclosed`, `session3-listing-pipeline`, `session4-payments`, `session4-webhook-verify`, `session5-production-safety`, `session6-brand`).

## Production changes NOT performed (require approval / dashboard access)
1. Apply migration `supabase/migrations/20260824000000_rls_storage_privacy_hardening.sql` to prod + run its verification queries.
2. **Live RLS verification** of client-read tables: `payment_methods`, `escrow_transactions`, `verification_documents`, `verification_requests`, `background_checks`, `user_encryption_keys`, `security_events`, `professional_account_requests`, `payment_plans`.
3. Confirm server `DATABASE_URL` == the Supabase Postgres (resolve split-brain); confirm `lost_pet_alerts*` tables exist there.
4. Set prod env: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, `STRIPE_MODE=live` + live keys + `STRIPE_WEBHOOK_SECRET`, one-time price envs, `OPS_SECRET`, `CRON_SECRET`, `SENTRY_DSN`, `SUPPORT_EMAIL`/`FROM_EMAIL`/`LEGAL_ENTITY_NAME`/`PUBLIC_APP_URL`.
5. Stripe dashboard: point webhook at `/api/stripe/webhook`. Redeploy hardened Supabase edge functions (`user-verification`, `send-notification-email`) or retire the client-amount ones (`stripe-payment`).
6. SendGrid SPF/DKIM sender verification; Supabase auth email template branding.
7. Run the Playwright E2E suite in CI against a test database.

## Remaining closed-beta blockers (genuine)
- **#1 and #2 above** (apply RLS/storage migration + verify live RLS on the crown-jewel tables). The Express layer is now hardened, but the browser talks to Supabase directly with the anon key, so those tables' live RLS is the last data-exposure surface. This is the single gating item.
- **#3** (single source of truth) — needed for reliable core workflows (a created listing must appear in the feed).

## Remaining public-launch blockers (separate from beta)
- Real payments end-to-end (owner sets live Stripe + prices + webhook; redeploy/retire edge functions) — items #4/#5.
- Final legal *text* (clauses) and named legal entity — item #6 (branding is now consistent; wording is templated).
- Verified transactional email domain — item #6.

## Closed Beta Readiness
**Before: 15% → After: ~70%.** Every code-reachable critical is closed and regression-tested: unauthenticated PII export/CRUD, cross-user IDOR (listings/messages/favorites/payouts/payments), payout hijack, forgeable verification, fake-success webhooks, client-controlled amounts, public diagnostics, hardcoded admin, and PII logging. Government-ID storage is private in code + migration. The remaining 30% is **not code** — it is applying the RLS/storage migration and verifying live RLS on the anon-key-read tables (#1/#2), which only the owner can do against prod. Once those land, closed beta is safe.

## Public Launch Readiness
**Before: 10% → After: ~45%.** Payments are now server-authoritative and fail-closed, brand identity is coherent (0 "My Pup"/"mypup.com" in the client), Lost & Found is wired, diagnostics/mocks are locked down. Gated on real-money enablement, final legal text + entity, verified email domain, and E2E-in-CI.

## Recommended next action
**Apply `20260824000000_rls_storage_privacy_hardening.sql` to production and run the live-RLS verification queries on the nine anon-key-read tables (blockers #1/#2).** That is the shortest path from "code-hardened" to "safe to invite testers" — it closes the only remaining data-exposure surface the Express layer cannot cover.
