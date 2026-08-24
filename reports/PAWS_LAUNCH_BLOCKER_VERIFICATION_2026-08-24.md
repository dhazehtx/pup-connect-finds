# PAWS — Launch-Blocker Verification Audit

**Date:** 2026-08-24 · **Repo:** `pup-connect-finds` · **Branch:** `main` · **HEAD:** `37706d9` · **Supabase:** `wneticxjhxpjpfghnclr` · **Type:** read-only verification (no files/DB/Stripe/infra touched)

> **Systemic root cause (governs most findings):** `server/middleware/auth.ts` `authMiddleware` is **permissive** — on a missing/invalid token it sets `req.isAuthenticated = () => false` and calls `next()`; it never rejects. Real protection requires the separate `requireAuth`/`requireAdmin`, which many mutating and PII routes omit. Several sensitive routes are also mounted *before* `authMiddleware` (`server/routes.ts:317`). Net effect: numerous endpoints that "look authed" are reachable fully unauthenticated in production.
>
> **Second structural fact:** the app runs a **split-brain data layer** — the browser talks to Supabase directly with the anon key (129 `.from()` calls → RLS is the only guard), while the Express server talks to **Neon** via Drizzle (`server/db.ts`, bypasses RLS) and sometimes to Supabase with the **service-role** key (also bypasses RLS). Some tables are written on one side and read on the other.

---

## Per-finding verdicts

| # | Finding | Verdict | Severity | Blocks |
|---|---|---|---|---|
| 1 | Unauthenticated listing create/update/delete | **CONFIRMED** | Critical | Closed beta |
| 2 | Missing ownership on listings/posts/comments | **CONFIRMED** | Critical | Closed beta |
| 2 | (bookmarks/saved-posts/group/community) | FALSE POSITIVE (properly scoped) | — | — |
| 3 | IDOR — messages (sender spoof + conv read) | **CONFIRMED** | High | Closed beta |
| 3 | IDOR — favorites | **CONFIRMED** | Medium | Closed beta |
| 3 | IDOR — account export (`/api/export-data`) | **CONFIRMED** | Critical | Closed beta |
| 3 | IDOR — account deletion (`/api/delete-account` body) | PARTIALLY (dead-shadowed) | Medium | Closed beta |
| 3 | IDOR — payouts (payout hijack) | **CONFIRMED** | Critical | Real payments |
| 3 | IDOR — payment/subscription (cancel, history, PI read) | **CONFIRMED** | Med-High | Real payments |
| 4 | Missing/insufficient RLS on client tables | **CONFIRMED** (+ large CANNOT VERIFY) | High | Closed beta |
| 5 | Public government-ID storage bucket | **CONFIRMED** | Critical | Closed beta |
| 6 | Two competing listing pipelines/schemas | **CONFIRMED** | High | Closed beta |
| 7 | Lost & Found page/API unwired | **CONFIRMED** | High (function) | Public launch |
| 8a | Multiple webhook handlers | **CONFIRMED** (3–4) | Medium | Real payments |
| 8b | Signature verification | PARTIALLY (live OK; dead/skip paths) | Med-High | Real payments |
| 8c | Client-controlled amounts / price IDs | **CONFIRMED** | High | Real payments |
| 8d | Live/test env selection | **CONFIRMED** (misresolves on Railway) | High | Real payments |
| 8e | Mock/fake-success Stripe fallback | **CONFIRMED** | High | Real payments |
| 8f | Idempotency | PARTIALLY (durable dedup wired to dead endpoint) | Med-High | Real payments |
| 9 | Hardcoded admin identifiers | **CONFIRMED** (`logs.ts`) | Medium | Public launch |
| 9 | Guest access to admin UI/API | FALSE POSITIVE (fail-closed) | — | — |
| 9 | Query/body userId trust for admin | FALSE POSITIVE (uses session) | — | — |
| 9 | Moderator treated as admin | **CONFIRMED** | Med-High | Closed beta |
| 10 | Public `/api/ops/*` diagnostic | **CONFIRMED** (infra topology) | Low | Public launch |
| 10 | debug / dev-stripe / sentry / fraud endpoints | OVERSTATED (prod-gated or unmounted) | — | — |
| 11 | Silent/fake — email | PARTIALLY (one true fake-success + silent no-ops) | Medium | Beta onboarding |
| 11 | Silent/fake — payments (UI) | **CONFIRMED** (simulated success surfaces) | High | Real payments |
| 11 | Silent/fake — identity verification | **CONFIRMED** (forgeable + unauth approval) | Critical | Closed beta |
| 11 | Silent/fake — demo/mock Supabase fallback | **CONFIRMED** (client) | High | Public config |
| 12 | Test/demo listings visible in production | PARTIALLY (no demo *listings*; a few demo *pages* reachable) | Low | Public launch |
| 13 | Legal/brand mismatch (PAWS/My Pup/Pup Connect) | **CONFIRMED** (pervasive, user-visible) | High | Public launch |
| 14 | Account deletion/export completeness | **CONFIRMED** (incomplete; leaves gov-ID + orphaned PII) | Critical | Closed beta |
| 15 | Prod Supabase/DB internal consistency | PARTIALLY (split-brain; unprovable from repo) | High | Closed beta |

---

## Verified Critical Findings

These are **CONFIRMED, production-reachable, and exploitable by an unauthenticated or low-privilege attacker** unless noted. Each exposes real PII, real money, or trust integrity.

1. **Unauthenticated PII export (IDOR).** `GET /api/export-data?userId=<victim>` (`server/routes.ts:1913-1915`) returns any user's email, name, location, **all conversation message content**, listings, and transactions — no auth, no ownership check. One request exfiltrates any user's data. *(Finding 3-export.)*

2. **Public government-ID storage bucket.** `provider-id-docs` is created `public=true` with `"Anyone can view provider ID documents" FOR SELECT USING (bucket_id='provider-id-docs')` (`supabase/migrations/20251106_provider_id_docs_storage_policies.sql:5-21`); the server forces `public:true` at runtime (`server/lib/ensureStorageBucket.ts:32-33,127`) and hands out permanent `getPublicUrl()` links (`server/routes/upload-id.ts:81,111,150,180`). Every uploaded driver's-license/passport image is world-readable. `message-attachments` is also public. *(Finding 5.)*

3. **Payout hijack (unauthenticated IDOR).** `/api/payout/link|start|status|dashboard-link` (`server/routes.ts:2519-2549`) have no `requireAuth` and resolve the actor as `req.user?.id ?? req.body?.userId ?? req.query?.userId` (`server/routes/payout/link.ts:37`, `start.ts:42`, `status.ts:19`). An anonymous caller can create a Stripe Express account bound to a victim's user_id and complete onboarding with the attacker's bank details (future transfers `deals.ts:300` pay the attacker), or pull the victim's Stripe **dashboard login link**. *(Finding 3-payouts.)*

4. **Forgeable identity/verification + unauthenticated provider approval.** `POST /api/provider-applications/review` and `PATCH /api/provider-applications/:id` (`server/routes/providerApplications.ts:146,513`) set `providers.verified=true` and `profiles.verified=true` via the service-role client, mounted **without** `requireAdmin` (`server/routes.ts:336`). Combined with the permissive `authMiddleware`, an unauthenticated caller who knows an applicationId can approve verification. The mock ID/webhook chain (`server/routes/providers/id/webhook.ts:35-84`, mounted "temporarily public" at `routes.ts:213,223`) lets a user self-drive `id_status:'passed'`. `supabase/functions/user-verification/index.ts:94-121` flips `profiles.verified=true` for any authenticated user. *(Finding 11-identity + new.)*

5. **Unauthenticated listing & post/comment CRUD (no ownership).** `POST/PUT/DELETE /api/listings[/:id]` (`server/routes.ts:509,520,535`), `POST /api/listings/:id/restore` (`:573`), `PATCH/DELETE /api/posts/:id` (`:1388,1401`), `PATCH/DELETE /api/comments/:id` (`:1474,1489`) — no `requireAuth`, no `WHERE user_id = req.user.id`. `user_id`/`seller_id` are client-supplied via the insert schema (`shared/schema.ts:298`). Anyone can create/edit/delete anyone's content. *(Findings 1, 2.)*

6. **`profiles` table world-readable + self-escalation (Supabase RLS).** `FOR SELECT USING (true)` on `profiles` (`supabase/migrations/20250611064257-...sql:52-54`) exposes email/phone/address and **`two_factor_secret`** to any anon-key holder via PostgREST. UPDATE policy has no column-scoped `WITH CHECK` (`:61-64`), so a user can `update({is_admin:true, verified:true})` on their own row. `subscription_analytics`, `donations`, `promotions` are also `USING(true)` read+write. *(Finding 4 + new.)*

7. **Client-controlled charge amounts on unauthenticated payment paths.** `POST /api/payments/create-payment-intent` (`server/routes.ts:1712,1720`) and `supabase/functions/stripe-payment/index.ts:38,42` take `amount` from the client with no server-side price lookup and no auth → pay $0.01 for anything. *(Finding 8c.)*

8. **Fake-success payment/webhook paths.** `/api/webhook/stripe` (`server/routes/webhook.ts:20-25`) processes `checkout.session.completed` into a `status:'paid'` order **without signature verification when `STRIPE_WEBHOOK_SECRET` is unset**; `getStripe()` falls back to `sk_test_mock_key` (`server/lib/stripeLazy.ts:13`); `supabase/functions/send-notification-email/index.ts:49-73` returns `{success:true, id:'mock-email-id', status:'sent'}` while sending nothing; several client components render "Payment Successful!" from a simulated flow (`PaymentIntegration.tsx:32-40`, `EscrowPaymentFlow.tsx:53`, `AddPaymentMethodDialog.tsx:30`), and `StripeCheckoutDemo` is routed in production (`StoreTab.tsx:18,408`). *(Findings 8e, 11.)*

9. **Account deletion is incomplete + wrong-target.** The best handler (`server/routes/user.ts:118`) is token-scoped (no IDOR) but **never deletes storage objects** (government-ID images survive in `provider-id-docs`) and queries a **nonexistent `listings` table** (`:186`) instead of Neon `dog_listings` (`shared/schema.ts:50`), so real listings/favorites/reviews are neither exported nor deleted. Two other competing delete handlers exist (`gdpr.ts` leaves the auth user; a body-`userId` variant at `routes.ts:2010` is dead-shadowed). *(Finding 14.)*

10. **Split-brain database.** Client writes some `dog_listings` via Supabase (`client/src/hooks/useCreateListing.ts:42`) while the primary explore feed reads Neon via `/api/listings` (`client/src/hooks/useListings.ts:89` → `server/storage.ts:435`). With no `DATABASE_URL` in the committed env and a `NEON_DATABASE_URL` present, server=Neon and client=Supabase are **different physical databases** — a listing created one way may never appear the other way. Plus the client silently falls back to a **demo Supabase project** (`https://abcdefghijklmnop.supabase.co`) if env vars are missing at build (`client/src/integrations/supabase/client.ts:6-8,40-47`). *(Findings 6, 15, 11-mock.)*

**Message sender spoofing** (`POST /api/messages`, `insertMessageSchema` client `sender_id`, `routes.ts:963`), **favorites IDOR** (`routes.ts:987-1043`), **subscription-cancel / payment-history IDOR** (`routes.ts:2211,2243`), and a **new unauthenticated PII leak `GET /api/qa/bug-reports`** (`server/routes/qa.ts:40`, mounted before auth) round out the confirmed set.

---

## Findings That Were Overstated or Wrong

- **Guest access to admin UI/API (F9b) — FALSE POSITIVE.** The mounted admin routers self-guard with `requireAdmin` + session `is_admin` (`server/middleware/requireAdmin.ts`, `admin.ts:12`, `adminDashboard.ts:27-28`). Guests get 401/403. (Some admin sub-routers are mounted *before* auth and therefore always 401 — broken, but fail-closed, not a hole.)
- **Admin trusts query/body userId (F9c) — FALSE POSITIVE.** Admin identity is read from the verified session, never from body/query.
- **Debug/dev-stripe/sentry/fraud endpoints (F10) — OVERSTATED.** `/api/dev/*` and `/api/dev/stripe/*` return 403 when `NODE_ENV==='production'`; `/api/debug` is `SCHEMA_DEBUG`-gated; `sentry-test.ts` and `fraudDemo.ts` are never mounted. The `/status` route that would leak a key prefix is 403 in prod. (The genuinely-exposed diagnostic is only `/api/ops/*` — infra host/port/user, Low severity.)
- **Subscription (monetization) IDOR (F3) — NOT reachable.** `monetizationRouter` is imported but never mounted (dead code).
- **Test/demo *listings* in production (F12) — NOT confirmed.** Seed routes are prod-gated (`routes.ts:2759`) and client test routes are `import.meta.env.DEV`-stripped. A few demo *pages* (`/fraud-demo`, `/rate-limit-demo`) are reachable but inject no marketplace data.
- **`bookmarks`/`saved-posts`/`group-posts`/`community` ownership (F2) — properly scoped** to `req.user!.id`; not vulnerable.
- **Correction to a sub-agent claim:** the developer `.env` is **NOT committed** — it is gitignored and `git ls-files` confirms it is untracked (only `.env.example`/`.env.staging.example` are tracked). It does locally mix `pk_live_` + `sk_test_` + `whsec_`, which is the real (non-leak) issue.

---

## Findings Already Fixed

No previously-flagged finding was found to be *fixed-since-flagged* with certainty from the repo. The closest to "already handled":
- Dev/seed/test endpoints are **already prod-gated** (`NODE_ENV==='production'` → 403) and most demo routes are `import.meta.env.DEV`-stripped — so the "test surface visible in production" concern is largely already mitigated (see Overstated).
- The **durable Stripe idempotency machinery already exists** (`server/lib/idempotency.ts`, `stripe_idempotency`/`stripe_events` tables) — but it is wired to the dead `/api/stripe/webhook` endpoint, not the live one, so it is built-but-unused rather than fixed.

Everything else in the original list is either CONFIRMED or CANNOT-VERIFY; none can be marked resolved.

---

## Newly Discovered Critical Findings

1. **Unauthenticated PII export** `GET /api/export-data?userId=` (`server/routes.ts:1913`) — arguably the single fastest data-breach path; not in the original "IDOR list" as a standalone.
2. **Unauthenticated provider-application approval → `profiles.verified=true`** (`server/routes/providerApplications.ts:146,513` mounted without `requireAdmin` at `routes.ts:336`).
3. **Self-escalation to `is_admin` via `profiles` UPDATE RLS** lacking column-scoped `WITH CHECK` (`20250611064257-...sql:61-64`); the client admin surface reads `is_admin` straight from the Supabase profile (`useRealtimeAdminLogs.ts`).
4. **`profiles.two_factor_secret` is world-readable** through the `USING(true)` SELECT policy — TOTP secrets exposed to any anon-key holder.
5. **`message-attachments` storage bucket is public** (`20250610055559-...sql:78-83`) — private message images world-readable.
6. **Unauthenticated `GET /api/qa/bug-reports`** leaks every reporter's identity + report text (`server/routes/qa.ts:40`).
7. **Prod Stripe mode can silently resolve to TEST keys** on Railway/Render because selection keys off `NEXT_PUBLIC_APP_ENV`/`VERCEL_ENV` (`server/lib/config.ts:2-3`), which those platforms don't set.
8. **CANNOT-VERIFY exposure on crown-jewel tables:** `payment_methods`, `escrow_transactions`, `verification_documents`, `background_checks`, `user_encryption_keys` are read by the client via the anon key but have **no RLS in any tracked migration** — their posture must be checked live in the Supabase dashboard before any beta.

---

## Closed Beta Readiness

**Can invited testers safely create accounts, use the core PAWS workflows, and report bugs without exposing the application to obvious security, privacy, or payment risks?**

**No.** The failure is not a handful of edge-case bugs — it is systemic and the blast radius is not contained to testers. The moment a tester uploads an ID for provider verification, that government document is **world-readable on the public internet**. Any anonymous person on the internet (not just testers) can export any user's email and private messages, read the `profiles` table (including 2FA secrets), hijack payouts, forge "verified" status, and edit/delete any listing or post. Core workflows are additionally unreliable because of the split-brain database (a created listing may not appear in the feed) and the silent demo-Supabase fallback. Accounts *can* be created and the UI *functions*, which is why this is not 0% — but the security/privacy posture is disqualifying.

**Closed Beta Readiness: 15%**

---

## Public Launch Readiness

Everything blocking closed beta, **plus**: payments are unsafe for real money (client-controlled amounts, payout hijack, fake-success webhook, in-memory-only idempotency, prod/test key confusion), the brand/legal identity is incoherent and user-visible (app says "PAWS / Pet Adoption Web Services", Terms & all email say "MY PUP" with a placeholder mailing address and no named legal entity, ops/SendGrid default say "Pup Connect"), a headline feature (Lost & Found) is fully unwired and dead-ends from the UI, and email delivery would silently no-op or hit test-only domains under real load.

**Public Launch Readiness: 10%**

---

## Immediate Repair Order

Shortest safe sequence to reach an **invited-tester closed beta** (payments can be disabled for beta — do #6 only if testers will touch real money). Each step is verify-then-fix; nothing here was changed.

1. **Close the systemic auth hole first.** Make `authMiddleware` reject unauthenticated requests on protected paths, *or* add `requireAuth` + a server-derived-owner predicate to every mutating/PII route. Concretely, the currently-unauthenticated set: `/api/export-data`, `/api/payout/*`, `/api/provider-applications/review` + `PATCH /:id`, `/api/listings` C/U/D + restore, `/api/posts|comments` U/D, `/api/messages` (drop client `sender_id`), `/api/favorites/*`, `/api/payments/create-payment-intent|cancel-subscription|history|intent/:id`, `/api/qa/bug-reports`. Stop trusting `req.body.userId`/`req.query.userId` anywhere.

2. **Make ID/verification storage private.** Set `provider-id-docs` and `message-attachments` to `public:false` (migration + `ensureStorageBucket.ts:32-33,127`), replace `getPublicUrl` with short-lived signed URLs (`upload-id.ts`), and fix the `"Anyone can view"` storage policies to owner-and-admin only.

3. **Lock down Supabase RLS.** Remove `USING(true)` SELECT on `profiles` (and stop exposing `two_factor_secret` to the client at all); add column-scoped `WITH CHECK` so users can't self-set `is_admin`/`verified`; tighten `subscription_analytics`/`donations`/`promotions`. **Verify in the dashboard** the RLS on the untracked crown-jewel tables (`payment_methods`, `escrow_transactions`, `verification_documents`, `background_checks`, `user_encryption_keys`).

4. **Resolve the database split-brain.** Decide the single source of truth, confirm the prod `DATABASE_URL`, and make the client-Supabase write paths and the server-Neon read paths use the **same** database (or route all listing writes through the server). Then **remove the silent demo-Supabase fallback** in `client/src/integrations/supabase/client.ts` — fail loudly on missing env instead of pointing at a demo project.

5. **Remove prod-reachable fake-success paths.** Delete/guard the `!endpointSecret` branch in `server/routes/webhook.ts`, the `sk_test_mock_key` fallback (`stripeLazy.ts:13`), the `mock-email-id` success in `send-notification-email`, and the simulated-payment UI surfaces / `StripeCheckoutDemo` route so nothing reports success without a real event. Fix the hardcoded admin allowlist (`logs.ts:81`) and decide whether `moderator` should be full admin (`requireAdmin.ts:27`).

6. **(Only if beta handles real payments) Make payments server-authoritative.** Amounts/price IDs from the DB catalog, never the client; consolidate to one signature-verified webhook with durable (DB) idempotency on the *live* endpoint; verify `APP_ENV`/Stripe key-mode resolves to live on the actual host (Railway/Render). Otherwise, disable checkout for the beta.

7. **Complete account deletion.** Delete storage objects (gov-ID images) and target the real `dog_listings` table; converge the three delete handlers into one token-scoped path that cascades across all PII tables.

8. **Before public launch (not required for closed beta):** unify the brand/legal identity (name a real entity, single domain, consistent Terms/Privacy/email/app), wire or hide Lost & Found, configure a verified transactional-email domain, and lock down `/api/ops/*`.

**Do not begin fixes without confirming the live prod values that the repo cannot show:** the prod `DATABASE_URL`, whether `STRIPE_WEBHOOK_SECRET`/live Stripe keys are set, which Supabase edge functions are actually deployed, and the live RLS on the untracked tables. Several severities swing on those.
