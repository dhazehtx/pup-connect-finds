# Whelping Launch Runbook

This runbook covers launch-day checks for the Whelping application-only flow with deposit-backed waitlist.

## Scope

- Service type: `whelping` (application-only, no direct booking)
- Waitlist deposit path:
  - `POST /api/services/whelping/waitlist/:providerId`
  - Stripe webhook receives `checkout.session.completed`
  - `whelping_waitlist_entries` transitions from `pending` to `paid/approved`

## Pre-Deploy Checklist

1. Database migration applied:
   - `migrations/20260417_whelping_waitlist_and_rules.sql`
2. Required env:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `DATABASE_URL` or `NEON_DATABASE_URL`
   - `BASE_URL` (recommended for redirect correctness)
3. Health checks green:
   - `GET /api/health`
   - `GET /api/health/supabase`
   - `GET /api/ops/supabase`

## Launch-Day Verification Commands

Run from repository root:

```bash
npx tsx scripts/whelping-waitlist-e2e-proof.ts
```

Expected: `overall: "PASS"` and `VERIFY_WAITLIST_PAID: PASS`.

Then run the full board:

```bash
npx tsx scripts/launch-readiness-board.ts
```

## Operational Monitoring

- Admin queue endpoint:
  - `GET /api/admin/whelping-waitlist`
- Watch for entries where:
  - `risk_flag = 1`
  - `deposit_status != paid`
  - provider verification is not `verified`
- Stripe events:
  - `GET /api/admin/stripe-events`

## Incident Triage

1. If checkout succeeds but waitlist remains pending:
   - Confirm webhook signature secret matches runtime.
   - Confirm webhook route is reachable and returning 200.
   - Re-run `scripts/whelping-waitlist-e2e-proof.ts` against current base URL.
2. If waitlist creation fails:
   - Verify provider is `whelping` and verified.
   - Confirm policy acknowledgment is present.
   - Confirm migration-created tables exist.
3. If Supabase/network is degraded:
   - Check `/api/ops/supabase`.
   - Hold launch if auth/storage availability is unstable.

## Rollback Plan

If critical issues are found post-deploy:

1. Disable Whelping entry points in UI (hide waitlist CTA feature flag or route guard if available).
2. Keep existing non-Whelping service flows active.
3. Investigate webhook and DB state with test proof script.
4. Redeploy with fix and re-run E2E proof before re-enabling.

