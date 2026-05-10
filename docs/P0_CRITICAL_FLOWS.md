# P0 — Critical user flows (launch gate)

These paths must work on **staging** before production launch. Use this doc for **manual QA**, **release sign-off**, and alignment with **Playwright** (`e2e/p0-critical-flows.spec.ts`, `e2e/master-flow.spec.ts`, etc.).

## Automation

| Suite | Command |
|-------|---------|
| P0-focused | `npm run test:e2e -- e2e/p0-critical-flows.spec.ts` |
| Guest + optional auth | `npm run test:e2e -- e2e/master-flow.spec.ts` |
| Lost & Found smoke | `npm run test:e2e -- e2e/lost-and-found.spec.ts` |
| Create post / messaging / provider / notifications | `e2e/critical-*.spec.ts` (need `E2E_*` env; see below) |
| Stripe checkout (full) | `e2e/pupbox-stripe-checkout.spec.ts` (needs DB + Supabase admin + Stripe test) |

Signed-in tests need a **verified** test account:

```bash
export E2E_EMAIL='verified-user@example.com'
export E2E_PASSWORD='...'
# Optional — messaging (find-or-create with peer profile UUID)
export E2E_PEER_USER_ID='uuid-of-another-user-with-profile'
# Optional — follow → notification for peer (third account)
export E2E_PEER_EMAIL='peer@example.com'
export E2E_PEER_PASSWORD='...'
npm run test:e2e
```

**Staging:** set `PLAYWRIGHT_BASE_URL=https://your-staging-host` (no trailing slash). The Playwright config uses it as `baseURL` for all e2e specs.

Local dev server defaults to `http://127.0.0.1:5001` (see `playwright.config.ts`). Requires working `DATABASE_URL` for `/api/health` to return 200.

---

## P0 flow list

### 1. Guest discovery → auth

| Step | Expected |
|------|----------|
| Open `/marketplace` or `/explore` logged out | Demo content or guest UI; no 500 |
| CTA to sign up / unlock | Navigates to `/auth` with sensible `mode` / `next` query |
| Open `/auth` | Sign in / sign up UI loads |

**Automated:** `e2e/master-flow.spec.ts` (marketplace guest), `e2e/p0-critical-flows.spec.ts` (auth + explore smoke).

---

### 2. Sign up / sign in / session

| Step | Expected |
|------|----------|
| Sign up | Request succeeds or “check email” path; no unhandled error |
| Sign in (verified user) | Redirect to app; session present |
| Refresh | Stays logged in (Supabase session) |
| Sign out | Session cleared; protected routes redirect or prompt auth |

**Automated:** `master-flow.spec.ts` (optional block with `E2E_EMAIL` / `E2E_PASSWORD`).

**Manual:** Email confirmation links use `NEXT_PUBLIC_BASE_URL` on staging (see `.env.staging.example`).

---

### 3. Home / feed / post

| Step | Expected |
|------|----------|
| `/` or `/home` (authed) | Feed loads |
| Create post (if applicable) | Submits without 500; appears in feed or confirmation |
| `/post/:id` | Permalink loads for author or as permitted |

**Manual** unless targeted e2e exists (high variance).

---

### 4. Marketplace & listing detail

| Step | Expected |
|------|----------|
| Browse listings | Grid loads |
| Open `/listing/:id` | Detail page; images and CTA render |
| Guest → auth for gated action | Redirect to `/auth` when required |

**Automated:** guest marketplace in `master-flow.spec.ts`.

---

### 5. Cart / checkout / pay (Stripe test)

| Step | Expected |
|------|----------|
| Add to cart → checkout | Stripe test flow completes or cancels cleanly |
| Webhook / order record | Order visible in history or admin test tools (env-dependent) |

**Automated:** `e2e/pupbox-stripe-checkout.spec.ts` (requires Stripe test env). **Staging:** use test keys only (`NODE_ENV=staging` + `server/lib/config.ts`).

---

### 6. Messaging

| Step | Expected |
|------|----------|
| `/messages` (authed) | Thread list or empty state |
| Open thread | Messages load; send shows optimistic or confirmed |

**Manual** or extend e2e with `E2E_*` creds (flaky if realtime).

---

### 7. Notifications

| Step | Expected |
|------|----------|
| `/notifications` (authed) | Page loads; list or empty state |

**Manual** short path unless notification test page is used.

---

### 8. Provider onboarding

| Step | Expected |
|------|----------|
| `/services/onboarding` or Become Provider modal | Multi-step flow saves via `/api/services/offerings/bulk` without 500 |
| Provider dashboard | Lists offerings after save |

**Manual** for full modal; API errors often environment/DB.

---

### 9. Bookings (if product-critical)

| Step | Expected |
|------|----------|
| Create booking flow | Confirmation + entry in `/bookings` or dashboard |

**Manual** unless dedicated e2e exists.

---

### 10. Lost & Found (if launched)

| Step | Expected |
|------|----------|
| `/lost-and-found` | Page loads; guest browse works |

**Automated:** `e2e/lost-and-found.spec.ts`.

---

### 11. API & infrastructure smokes

| Endpoint | Expected |
|----------|----------|
| `GET /api/health` | 200 when DB configured; documents env |
| `GET /api/services/search` | JSON `{ success, data, count }` |

**Automated:** `e2e/p0-critical-flows.spec.ts`.

---

## Sign-off checklist (staging)

- [ ] All P0 rows above run **once on staging URL** with staging env (Supabase + Stripe test + `NEXT_PUBLIC_BASE_URL`).
- [ ] No P0 blocker bugs open.
- [ ] Sentry (or logs) reviewed for errors during the run.

---

## References

- Staging env: `.env.staging.example`, `server/env/loadEnv.ts`
- Stripe staging: `server/lib/config.ts`, `server/lib/stripeEnv.ts`
- Supabase staging: `client/src/lib/supabaseEnv.ts`, `server/lib/supabaseEnv.ts`
