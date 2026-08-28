# PAWS — Fast-Track Certification: Owner Action Items

_Generated 2026-08-28 during the fast-track certification sprint. Engineering candidate: `8df483a` (5 commits ahead of production `926611c`). Everything below is code-grounded from a fresh inventory of the repository; nothing here has been applied. No live money, no config changes were made._

These are the items that **require the owner (Danny)** because they need credentials, DNS, a dashboard, DB access, or a business decision. Engineering has done everything it safely can without them.

---

## 1. OWNER TEST ACCOUNTS REQUIRED (unblocks authenticated E2E certification)

The authenticated buyer/seller/messaging/checkout certification flows cannot run without dedicated **throwaway** test accounts. The owner/admin account must **never** be used for this (it would mutate real identity/orders/listings).

The Playwright harness already contains these flows in `e2e/cert/auth-buyer-seller.cert.spec.ts`; they **self-skip** until credentials are supplied via environment variables (never hardcoded, never committed).

**Please create (in the app, confirming the verification emails):**

| Var | Purpose |
|---|---|
| `CERT_BUYER_EMAIL` / `CERT_BUYER_PASSWORD` | A buyer test account |
| `CERT_SELLER_EMAIL` / `CERT_SELLER_PASSWORD` | A seller test account with at least one test listing |

Suggested addresses: `paws-cert-buyer+test@<yourdomain>` and `paws-cert-seller+test@<yourdomain>`.

**Then run:**
```bash
CERT_BASE_URL=https://petadoptionwebservices.com \
CERT_BUYER_EMAIL=... CERT_BUYER_PASSWORD=... \
CERT_SELLER_EMAIL=... CERT_SELLER_PASSWORD=... \
npx playwright test --config playwright.cert.config.ts auth-buyer-seller
```
Email verification is the only human gate — the rest is automated. Set the vars in a local `.env` (already gitignored) or your shell; do not commit them.

---

## 2. OWNER ACTION — DATABASE MIGRATIONS (apply to production Supabase)

Agents never run remote migrations. These prepared, reviewed migration files are additive and safe; **you apply them**. Verify each isn't already applied first (some may be).

1. **`supabase/migrations/20260828000000_search_trgm_indexes.sql`** _(new this sprint)_ — pg_trgm GIN indexes for the search columns. This is the **dominant fix for the 2–6s search latency (P2-4)**: the search endpoints use leading-wildcard `ILIKE '%term%'`, which sequentially scans without these. Additive, idempotent (`IF NOT EXISTS`). For large tables, use the `CONCURRENTLY` form noted in the file header.
2. **`supabase/migrations/20260824000005_system_logs.sql`** — the `system_logs` table. Its writer is already wired in the server (`server/services/loggingService.ts`), but **the table is not in production, so every persisted log is silently dropped**. Applying this turns on durable app logging.
3. **Verify** `supabase/migrations/20260824000004_stripe_webhook_infra.sql` (`stripe_events` / `stripe_idempotency`) is applied — the canonical webhook 500s on every event without these tables. (The rollback runbook suggests it may already be applied; confirm.)

---

## 3. OWNER ACTION — MONITORING (move from ~55% to beta-sufficient)

**Present & healthy today:** health endpoints (`/api/health`, `/api/health/live` with deploy SHA, `/api/health/supabase`, ops-guarded `/api/health/detailed`); rollback runbook (`PAWS_ROLLBACK_RUNBOOK.md`) and backup runbook (`PAWS_BACKUP_RUNBOOK.md`), both validated 2026-08-27.

**Gaps that need you:**
- **Error visibility is console-only.** Uncaught 500s appear only in Railway stdout — nothing is persisted or alerted. Apply `system_logs` (item 2) to enable durable logging.
- **Sentry is code-complete but inert.** Deps + init are in place (`server/utils/sentry.ts`, `client/src/main.tsx`) but gated on `SENTRY_DSN` / `VITE_SENTRY_DSN`, which are unset. **Create a Sentry project and set the DSNs** (Railway for server, build env for client). _Engineering note: there is also an error-handler ordering issue (`globalErrorHandler` terminates before `Sentry.expressErrorHandler()`); flagged as a recommended code follow-up so captures actually fire once a DSN exists._
- **Uptime monitor:** point any uptime provider (UptimeRobot/BetterStack/Pingdom) at `GET /api/health/live` (requires a provider account).
- **Webhook failures aren't queryable in-app** (only Stripe Dashboard + Railway logs). Recording them needs a new status column (a migration) — defer to post-beta unless desired.
- **Automated DB backups / PITR:** the Supabase free plan has none. Upgrading is a billing decision (`PAWS_BACKUP_RUNBOOK.md` §OWNER ACTIONS). For beta, the manual `pg_dump` runbook is the interim.

**Minimum for beta:** apply `system_logs`, set a Sentry DSN, and add one uptime check on `/api/health/live`.

---

## 4. OWNER ACTION — EMAIL

**Works today (via Supabase Auth, no provider needed):** signup **email verification** and **password reset** (`client/src/hooks/useAuth.ts`). This is beta-sufficient for auth.

**Not implemented / needs you:**
- **Transactional provider is dormant.** A SendGrid integration exists (`server/utils/emailService.ts`, `server/lib/sendEmail.ts`) but no-ops until `SENDGRID_API_KEY` + a verified sender (`SENDGRID_FROM`/`FROM_EMAIL`) are set. Welcome/GDPR-export/GDPR-deletion emails are code-ready and will start working once a key + sending domain (SPF/DKIM/DMARC DNS) are configured. Nothing forces SendGrid specifically — any provider works if the two wrapper modules are pointed at it.
- **Support intake email is missing.** The Contact form (`client/src/pages/Contact.tsx`) is a client-only shell — it logs and toasts, sends nothing. The in-app support-ticket store (`server/routes/support.ts`) works but is **auth-only** (guests can't file), and no email is sent on ticket creation. Wiring a guest-capable contact path is an owner/design decision (needs either a guest endpoint or an email route + `SUPPORT_INBOX_EMAIL`).
- **Commerce emails not implemented:** buyer order confirmation, seller sale notice, payment-failure notice — no code exists; the Stripe webhook handlers are DB-only. These are net-new work + the provider setup above (before public launch, not beta).

**Minimum for beta:** verification + reset already work. Decide how support requests reach you (even a `mailto:` interim) before inviting testers.

---

## 5. OWNER ACTION — STRIPE (keep TEST for beta; LIVE prep only)

**Do not enable LIVE for closed beta.** Production is confirmed TEST (live bundle carries `pk_test_…`, zero `pk_live_`). The detailed, ordered TEST→LIVE cutover checklist lives in `PAWS_STRIPE_LIVE_CUTOVER_RUNBOOK.md`. Key facts + gaps found this sprint:

- **Two Stripe integrations** must both be cut over: the Express server (`server/`) and the Supabase Edge Functions (`supabase/functions/*`, which read their own Supabase project secrets).
- **Local `.env` has a mode mismatch:** `STRIPE_SECRET_KEY=sk_test_…` but `VITE_STRIPE_PUBLIC_KEY=pk_live_…`. Production is coherent TEST (Railway overrides the publishable key at build), so this is a **local cleanup item** — but a build from local `.env` would ship a live publishable key with a test secret. Recommend fixing the local `.env` (owner; agents don't edit `.env`).
- **Seller Connect accounts are mode-specific:** every `acct_…` created in TEST is invalid under a live key — **all sellers must re-onboard** in live before payouts.
- **No `charge.dispute.*` (chargeback) handler** exists — add one before taking live volume.
- **Fixed price/product IDs** (Pup Box `PUPBOX_CATALOG_JSON`, subscription `products.stripe_price_id`) must be re-created in the live dashboard; store one-time checkout is mode-agnostic (`price_data`) but subscriptions are not.

**For beta:** no action — stay TEST.

---

## 6. OWNER / LEGAL REVIEW CHECKLIST

Engineering renders the legal pages correctly (owner-note drafting text removed in `926611c`; specific titles added this sprint). The following are **illustrative values still in customer-facing copy** — confirm against your actual operations and counsel. Do not treat these as legal advice; engineering did not invent or change substantive terms.

**Shipping (`/legal/shipping`):**
- "1–2 business days" order processing window
- Carriers "USPS, UPS, or FedEx"
- Service regions / restrictions language

**Returns (`/legal/returns`):**
- "30 days of delivery" return window
- "5–10 business days" refund timing
- "48 hours" damage-report window
- Subscription proration / skip-month / cancellation rules (must match what Stripe + the app actually allow)

Confirm each with your fulfillment reality and legal/payment advisor before public launch.

---

## Summary — minimum to start closed beta

1. Create the two test accounts (item 1) so authenticated certification can run.
2. Apply `system_logs` + the trgm search-index migration (item 2).
3. Set a Sentry DSN + one uptime check on `/api/health/live` (item 3).
4. Decide the support-contact path (item 4).
5. Stripe stays TEST (item 5). Legal review (item 6) can run in parallel with beta.
