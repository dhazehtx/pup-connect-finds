# PAWS — Rollback / Recovery Runbook

Scope: how to revert PAWS production to a known-good state. Two independent axes —
**code** (Railway/GitHub) and **database** (Supabase). Roll back the axis that broke;
they are decoupled.

Production: Railway `practical-kindness` → `production` → `pup-connect-finds`
(auto-deploys from GitHub **`main`**). Domain: `https://petadoptionwebservices.com`.
Supabase: `wneticxjhxpjpfghnclr`. Stripe: **TEST** mode (do not change during rollback).

## Known-good SHAs (most recent first)

| SHA | Description |
|---|---|
| `753c58c` | Messaging + checkout P0 fixes (current prod) |
| `e40e4a9` | Supabase demo-fallback fail-fast |
| `6ce5d6c` | Stripe webhook infra migration added |
| `511d58a` | Corrected profiles privilege migration |
| `a2d3505` | Canonical webhook raw-body fix |

Always confirm the live SHA first:
```bash
railway status --json | python3 -c "import json,sys;d=json.load(sys.stdin);s=d['environments']['edges'][0]['node']['serviceInstances']['edges'][0]['node'];dep=s.get('latestDeployment') or (s.get('activeDeployments') or [{}])[0];print((dep.get('meta') or {}).get('commitHash'), dep.get('status'))"
```

## A. CODE rollback (bad deploy, app-level bug, no DB change)

Because Railway auto-deploys `main`, there are two ways to roll code back:

### A1 — Railway redeploy of a previous SUCCESS deployment (fastest, no git change)
1. Railway dashboard → service `pup-connect-finds` → **Deployments**.
2. Find the last **SUCCESS** deployment that was healthy (note its commit).
3. Use **Redeploy** on that deployment (or the row's ⋯ → Rollback).
   - CLI equivalent for the *latest* image: `railway redeploy` (redeploys current);
     `railway restart` restarts without rebuild. To pin an *older* commit, prefer A2.
4. Verify (see "Post-rollback verification").

### A2 — Git revert on `main` (durable, auditable — preferred for code defects)
```bash
git fetch origin
git checkout main && git reset --hard origin/main
# revert the bad commit(s) (creates a new commit; does NOT rewrite history):
git revert --no-edit <bad_sha>            # or: git revert --no-edit <newer>..<older-good>
git push origin main                      # Railway auto-deploys the reverted main
```
To hard-pin to an older good SHA (only if reverts are messy and you accept losing
intermediate commits from prod): `git reset --hard <good_sha> && git push --force-with-lease origin main`
— **force-push is a last resort**; prefer `git revert`.

> Note: `railway up` from a working tree is a **temporary override** that the next
> GitHub-triggered deploy replaces. For durable rollback use A1 or A2, not `railway up`.

## B. DATABASE rollback (bad migration / data corruption)

The hardening migrations (`20260824000000`–`000005`) are **additive, idempotent,
and delete no data**, so a code rollback usually needs **no** DB rollback. Handle DB
rollback only for a genuinely destructive change.

### B1 — Reverse a specific migration (preferred; surgical)
Most PAWS migrations are additive; to reverse one, apply a compensating forward
migration (e.g. re-`GRANT` what was `REVOKE`d, `DROP` a table that was `CREATE`d).
Never restore the whole DB to undo one policy. Author the compensating SQL, test on
a scratch cluster (see below), then apply via the Supabase SQL editor.

### B2 — Full restore from backup (last resort; data loss between dump and now)
1. **Take a fresh dump first** (capture current state before overwriting) — see
   `PAWS_BACKUP_RUNBOOK.md`.
2. Restore the chosen dump into the Supabase DB:
   ```bash
   # PG* env from DATABASE_URL (session pooler :5432, sslmode=require), secret not printed
   pg_restore --no-owner --clean --if-exists -d "$PGDATABASE" <backup>.dump
   ```
   `--clean --if-exists` drops+recreates objects; **this overwrites current data** —
   only run against production with explicit owner authorization.
3. Re-verify RLS/grants and app health.

> Restore validated 2026-08-27 into a disposable local PG17 cluster: all app data +
> 188 RLS policies restored; only `supabase_vault` objects errored (absent in vanilla
> PG, present in real Supabase — benign). See backup runbook.

### Test any DB rollback on a scratch cluster first
```bash
initdb -D /tmp/pg && pg_ctl -D /tmp/pg -o "-c port=5599" start
# create anon/authenticated/service_role roles, apply migrations, then the compensating SQL
```

## C. STRIPE / webhook implications

- Rolling code back across `a2d3505` (raw-body webhook fix) or `6ce5d6c`
  (`stripe_idempotency`/`stripe_events` tables) will **re-break** webhook processing.
  Do **not** roll code back past those SHAs without accepting webhook breakage.
- The `stripe_idempotency` table means Stripe **retries** of events already processed
  are ignored — so a brief outage/rollback does not double-process payments once
  restored. Stripe auto-retries failed webhook deliveries for up to 3 days.
- Never change `STRIPE_MODE` during a rollback.

## Post-rollback verification (run every time)
```bash
curl -sS https://petadoptionwebservices.com/api/health           # status ok, db+supabase healthy
curl -sS https://petadoptionwebservices.com/api/health/live -o /dev/null -w "%{http_code}\n"  # 200
# confirm live SHA is the intended one (command at top)
# spot-check the flow that broke (messaging inbox / store checkout) via the app
```

## Decision tree
- App bug, DB fine → **A** (A1 fast, A2 durable). No DB action.
- Bad additive migration, no data loss → **B1** compensating migration.
- Destructive migration / data loss → fresh dump, then **B2**, then verify.
- Env-var mistake → fix the Railway var (triggers a redeploy); no code/DB rollback.

## OWNER ACTIONS
- Confirm who has Railway + Supabase dashboard access for emergency rollback.
- Keep this file and `PAWS_BACKUP_RUNBOOK.md` current as new known-good SHAs land.
