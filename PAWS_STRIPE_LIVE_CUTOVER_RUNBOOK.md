# PAWS — Stripe LIVE Cutover Runbook

> **Do not execute any of this yet.** This documents what a future live cutover
> requires. PAWS is TEST mode today and must stay TEST until an explicit, separate
> go-live decision. No live credentials, no real charges.

Derived from the pre-launch Stripe engineering audit. File:line references point
at the code that must be satisfied.

## 0. Biggest gotcha (read first)

Stripe client init is split: most money code uses the mode-aware `getStripe()`
(`server/lib/stripeLazy.ts` + `server/lib/config.ts:30`), but Connect/payout/refund/
sync code reads **raw `process.env.STRIPE_SECRET_KEY`** directly
(`lib/stripe/connect.ts:4`, `routes/payout/*`, `routes/stripe/create-connect-account.ts`,
`utils/stripeSync.ts:9`, `services/refundService.ts:13`). **Therefore set the
top-level `STRIPE_SECRET_KEY` to the LIVE value** (not only `STRIPE_SECRET_KEY_LIVE`),
or those paths keep using test/mock keys. Startup validation
(`config.ts:validateStripeKeyMode`) only logs a mismatch — it does not block boot.

## 1. Environment variables to set (Railway production)

| Var | Live value | Why |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` | Required by raw-env consumers (Connect/payouts/refunds/sync) AND config resolver |
| `STRIPE_WEBHOOK_SECRET` | live signing secret of the registered endpoint | Signature verification |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_…` | Client build-time publishable key (the runtime component reads this, not the NEXT_PUBLIC_* split) |
| `STRIPE_MODE` | `live` | Forces live branch in validation/publishable resolution |
| `BASE_URL`,`PUBLIC_APP_URL`,`FRONTEND_URL`,`CLIENT_URL`,`APP_URL` | `https://petadoptionwebservices.com` | All 5 are used across checkout/connect/payout redirects; unset ones fall back to localhost or throw |
| `CRON_SECRET` | strong secret | Auth for `/api/payouts/release` |
| `CONNECT_APP_FEE_BPS` / `PLATFORM_FEE_PERCENT` | your fee | Default 0 (no platform fee) |
| Supabase secrets (only if edge functions used) | live `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Edge functions read Supabase's own env, not Railway's |

Optional mirrors (belt-and-braces): `STRIPE_SECRET_KEY_LIVE`, `STRIPE_WEBHOOK_SECRET_LIVE`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE`.

## 2. Stripe dashboard (LIVE account "My Pup Network")

1. **Register exactly ONE webhook endpoint** and paste its live signing secret into
   `STRIPE_WEBHOOK_SECRET`. **Resolve the canonical-endpoint discrepancy first:** the
   code's most complete, DB-idempotent handler is `POST /api/stripe/webhook`
   (`server/routes/stripe/webhook.ts` — handles account.updated, transfers, refunds,
   deals, identity, checkout.session.completed, invoice.*). The docs
   (`DEPLOYMENT.md:62`, `.env.example:76`) name `/api/webhooks/stripe` (handler #2,
   in-memory dedup only). **Pick `/api/stripe/webhook`** and subscribe it to:
   `checkout.session.completed`, `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `account.updated`, `transfer.created`,
   `transfer.reversed`, `charge.refunded`, `refund.created`, `invoice.paid`,
   `invoice.payment_failed` (+ `identity.verification_session.*` if used).
   **Do NOT register `/api/webhook/stripe` (handler #3)** — it has no idempotency and
   unconditionally creates an order → duplicate orders on Stripe retries.
2. **Enable Connect (Express)** on the live account; complete the platform profile/
   branding. Each seller must complete live Express onboarding before
   `transfers.create` (payout release) succeeds.
3. **Subscriptions / Pup Box (only if launching them):** create live Products +
   recurring Prices; put the `price_…`/`prod_…` ids into `products.stripe_price_id`
   and `PUPBOX_CATALOG_JSON`, then run `npm run store:sync-catalog`. Replace the
   placeholder price ids at `routes.ts:1845` (`price_premium_monthly`) and the
   hardcoded test price in `scripts/createTestProducts.ts`. One-time store checkout
   needs NO live prices (it uses inline `price_data` — mode-agnostic).

## 3. Database preconditions (verify present in the live DB)

`stripe_idempotency`, `stripe_events` (migrations …004), `payouts` (`stripe.sql`),
`orders`, `order_items`, `products`, `subscriptions`, `refunds`, and — if the
escrow/deposit "deals" flow is enabled — `deals`, `deal_payments`, `deal_payouts`
(**these exist only in Drizzle `shared/schema.ts`; no SQL migration creates them —
confirm they exist or the `/api/deals/*` + `payment_intent.succeeded` paths throw**).
If the escrow flow is NOT part of first launch, leave it unused (admin-only surface).

## 4. Code items to resolve before live (not yet done — out of this sprint)

- Consolidate to the single DB-idempotent webhook handler; stop mounting/registering
  handlers #2 and #3 (double-processing risk).
- The `RefundService` router (`server/routes/refunds.ts`) is unmounted, uses a mock
  charge id, and has commented-out admin checks — do not wire it for live without
  restoring admin auth + real charge ids. The reachable refund path is the
  admin-gated `POST /api/deals/:dealId/refund`.
- Add Stripe idempotency keys to `refunds.create` / `transfers.create`.
- `lib/stripe/connect.ts` returns MOCK Connect accounts when the key is
  `sk_test_mock` — harmless with a real key, but confirm no mock branch is hit live.
- Make `validateStripeKeyMode` fail-closed at boot for a live/test mismatch (today
  it only logs).

## 5. Cutover sequence (when authorized)

1. Take a fresh DB backup (`PAWS_BACKUP_RUNBOOK.md`).
2. Set all env vars in §1 (this triggers a Railway redeploy — expected).
3. Register the live webhook (§2.1); paste its secret; confirm §3 tables.
4. Verify boot: `/api/health` ok; check logs for `validateStripeKeyMode` — no
   mismatch warning; confirm `STRIPE_MODE=live`.
5. Smoke test with a **real** low-value transaction you refund immediately, OR
   Stripe's live-mode test tooling if available. Confirm: checkout session created
   (`livemode:true`), webhook delivered + signature verified + one `stripe_events`
   row, order → paid. Then a Connect payout release to a fully-onboarded test seller.
6. Monitor the Stripe dashboard webhook delivery + `/admin/stripe-events`.

## 6. Rollback

Revert the env vars to test values (redeploys), unregister the live webhook, and see
`PAWS_ROLLBACK_RUNBOOK.md`. `stripe_idempotency` prevents double-processing of any
events already handled.

## OWNER ACTIONS (all of §1–§3 are owner/non-code)
Set env vars, register the webhook, enable Connect, create live products/prices,
verify DB tables. Do not insert live credentials into the repo or any client bundle.
