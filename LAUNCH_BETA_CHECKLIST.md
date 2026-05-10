# Launch / beta checklist (one page)

Use this as the **go/no-go** list for a first beta. Software is never “done”; this is **enough** to invite real users without surprises.

**Related:** owner-only items → [`PAWS_FINAL_OWNER_INPUTS.md`](./PAWS_FINAL_OWNER_INPUTS.md) · Whelping ops → [`docs/WHELPING_LAUNCH_RUNBOOK.md`](./docs/WHELPING_LAUNCH_RUNBOOK.md)

---

## 1. Environment & deploy (do first)

- [ ] **Staging or production URL** decided; same env shape as local (no mystery vars).
- [x] **Repo:** SQL migrations present for core flows (e.g. `migrations/20260401_bookings_table.sql`, `migrations/20260417_whelping_waitlist_and_rules.sql`, pet service providers, Stripe events, etc.).
- [x] **Repo:** [`.env.example`](./.env.example) documents `DATABASE_URL`, Supabase, and related server/client variables (copy to `.env` at repo root).
- [ ] **Host:** Secrets set on **your** deploy target (`DATABASE_URL`, Supabase keys, Stripe keys, `BASE_URL`, webhook secret) — *owner / deploy*.
- [ ] **Deployed** app + API reachable; `GET /api/health` OK on **beta URL** — *owner / deploy*.
- [x] **Local dev tip:** If `GET /api/ops/supabase` returns “route not found”, the API process may be an **older build** — restart from current `server/` so `registerHealthRoutes` (see `server/routes/health.ts`) is active.

---

## 2. Objective green board (engineering)

Run against **the same base URL** beta users will hit:

```bash
MESSAGING_VERIFY_BASE_URL=https://YOUR-API npx tsx scripts/launch-readiness-board.ts
```

- [x] **8/8 checks green** — verified locally `2026-04-19` against `http://127.0.0.1:3017` (overall GREEN, 100%).
- [x] **`/api/health/supabase`** returns healthy snapshot — same run (mode healthy, no consecutive failure storm).
- [x] **`/api/ops/supabase`** returns real ops JSON (`ok`, `mode`, `host`, `snapshot`) — same run on **3017** (not stale port without routes).
- [ ] Re-run board against **staging/production URL** after deploy — *owner / CI*.
- [x] **Whelping waitlist + deposit webhook** — `npx tsx scripts/whelping-waitlist-e2e-proof.ts` **PASS** (`2026-04-19`, base `http://127.0.0.1:3017`).

---

## 3. Stripe & money (owner + verify)

- [ ] **Test vs live** mode matches your intention for this beta — *owner decision*.
- [ ] **Webhook URL + signing secret** in Stripe Dashboard match runtime — *owner*.
- [ ] **One real checkout** (test or small live) on **beta URL** — *owner*.
- [x] **Engineering proof (local):** Stripe self-test + Stripe webhook E2E both passed in the same launch-board run as §2 (`pupbox-stripe-self-test`, `stripe-webhook-e2e-proof`).
- [ ] **Support path** for failed payments published (email or ticket) — *owner*.

*Detail:* `PAWS_FINAL_OWNER_INPUTS.md` → Stripe / Checkout.

---

## 4. Supabase & auth stability

- [ ] Supabase project **Healthy** in dashboard (ongoing ops) — *owner*.
- [x] **At verification time:** Auth/API path healthy enough for booking + messaging + notification scripts to create users (see §2 green board `2026-04-19`).
- [ ] Firewall/VPN/adblock not blocking `*.supabase.co` on **prod/staging** networks — *owner QA*.

---

## 5. UX polish (core flows)

Manual smoke, **mobile + desktop** — *owner / QA*.

- [ ] Browse → provider → **book** (non-Whelping) end-to-end.
- [ ] **Whelping:** waitlist → deposit redirect → return URL (if applicable).
- [ ] **Messages** send/receive.
- [ ] **Notifications** sensible; unread counts.
- [ ] **Store / checkout** success + cancel; order history if applicable.
- [ ] **Errors:** no infinite spinners; retry where needed.

### 5.b Payments & Stripe (engineering + owner)

- [ ] Stripe Dashboard webhook URL matches **`POST /api/webhooks/stripe`** (canonical handler; aligns with `/api/stripe/webhook` behavior for checkout completion).
- [ ] **`npm run verify:payments-smoke`** with `PAYMENTS_VERIFY_BASE_URL=https://YOUR-API` — Pup Box endpoint responds; `/api/products` loads.
- [ ] **Store:** cart + Buy Now (`/api/checkout/session`) completes; webhook marks order paid and adjusts inventory (`metadata.order_id` path).
- [ ] **Pup Box:** set **`PUPBOX_CATALOG_JSON`**, run **`npm run store:sync-catalog`**, verify **`GET /api/pupbox/plans`** shows `configured: true` and `inDatabase: true` — then subscription vs one‑time carts check out separately (no mixed cart).
- [ ] **Listings escrow:** deposits/balance settle on the platform Connect balance; **`POST /api/deals/:id/release`** transfers net to seller after dispute window; no release while **`DISPUTED`**.
- [ ] Launch fees: **`PLATFORM_FEE_PERCENT`** and **`CONNECT_APP_FEE_BPS`** default to **0** unless explicitly set.

---

## 6. Legal, trust, and copy (owner)

- [ ] Terms, privacy, guidelines, shipping/returns match reality — *owner / counsel*.
- [ ] Whelping / deposit rules visible and consistent with admin actions — *owner review*.
- [ ] Support contact + beta response expectation — *owner*.

*Detail:* `PAWS_FINAL_OWNER_INPUTS.md` → Legal / Trust / Operations.

---

## 7. Beta launch comms

- [ ] What’s **in scope** for beta + known gaps (one short note to testers) — *owner*.
- [ ] How to **report bugs** — *owner*.
- [ ] **Rollback / kill-switch** owner (who disables risky flows if needed) — *owner*.

---

## 8. After beta (not blocking day one)

- [ ] Metrics you care about (signups, conversion, errors).
- [ ] Deeper Stripe refunds automation, policies, roadmap from feedback.

---

## Release gate (sign-off)

- [x] **Engineering (local):** launch board 8/8 + Whelping E2E proof — see **Verification log** below.
- [ ] **Engineering (deployed):** same checks on **beta/staging URL**.
- [ ] **Owner:** Stripe + legal + support + catalog per `PAWS_FINAL_OWNER_INPUTS.md`.
- [ ] **Beta:** comms + rollback agreed; date set.

**Signed:** _________________ **Date:** _________________

---

## Verification log (automated — do not edit by hand unless re-running)

| When | Base URL | Launch board | Whelping E2E |
|------|-----------|--------------|--------------|
| 2026-04-19 | `http://127.0.0.1:3017` | GREEN 8/8 (100%) | PASS |

**Command to reproduce:**

```bash
MESSAGING_VERIFY_BASE_URL=http://127.0.0.1:3017 npx tsx scripts/launch-readiness-board.ts
MESSAGING_VERIFY_BASE_URL=http://127.0.0.1:3017 npx tsx scripts/whelping-waitlist-e2e-proof.ts
PAYMENTS_VERIFY_BASE_URL=http://127.0.0.1:3017 npm run verify:payments-smoke
```

Replace host/port with your API when verifying staging/production.
