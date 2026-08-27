# PAWS — Backup Runbook

Production Supabase project: **`wneticxjhxpjpfghnclr`** (region `aws-0-us-east-2`).
Free plan — **no automated managed backups / no PITR**. Backups are manual `pg_dump`.

> This runbook was validated on 2026-08-27: a full production dump restored into a
> disposable local Postgres 17 cluster with all app data + RLS policies intact
> (see "Validation" below).

## What to back up

A single logical dump captures **schema + data + RLS policies + grants**. It does
**not** capture: Supabase Auth users' passwords beyond the `auth` schema tables in
the dump, Storage bucket *objects* (files), Edge Function code, or project config.
Those are covered by the "Also back up" section.

## Prerequisites

- PostgreSQL 17 client tools (`pg_dump`, `pg_restore`, `psql`): `brew install postgresql@17`.
- The production `DATABASE_URL` (Supabase → Project Settings → Database → Connection string).
  In this repo it is the Railway var `DATABASE_URL` — read it without printing:
  `railway variables --json | python3 -c "import json,sys;print(json.load(sys.stdin)['DATABASE_URL'])"`
- **Never print the credential**; pass it via `PG*` env vars.

## Take a backup (custom format — recommended)

```bash
# Derive PG* env from DATABASE_URL WITHOUT echoing the secret.
# Use the SESSION pooler (port 5432) for pg_dump, sslmode=require.
BR=paws-prod-wneticxjhxpjpfghnclr
TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT=~/Desktop/paws-backups/$BR-$TS.dump
mkdir -p ~/Desktop/paws-backups
# (export PGHOST/PGPORT=5432/PGUSER/PGPASSWORD/PGDATABASE/PGSSLMODE=require from DATABASE_URL first)
/opt/homebrew/opt/postgresql@17/bin/pg_dump -Fc --no-owner -f "$OUT"
```

Custom format (`-Fc`) is compressed and allows selective/parallel restore. For a
human-readable SQL backup instead, use `-Fp -f backup.sql`.

## Verify a backup (always do this)

```bash
B=$(ls -t ~/Desktop/paws-backups/*.dump | head -1)
ls -lh "$B"                                   # non-zero size (~0.9 MB today)
pg_restore -l "$B" | wc -l                    # table-of-contents entry count (~1471)
pg_restore -l "$B" | grep -c 'TABLE DATA'     # data sections (~122)
pg_restore -l "$B" | grep -E 'public (profiles|dog_listings|conversations|messages|products)'
```

A valid backup: exit 0 from `pg_dump`, non-zero file, TOC lists the core tables.

## Cadence & retention (recommended for closed beta → launch)

- **Closed beta:** daily manual dump; keep 14 days + 1 weekly for 8 weeks.
- **Before any production migration or deploy that touches data:** take a dump
  first and record its filename in the deploy notes.
- Store off the laptop too (e.g. an encrypted drive / private bucket). Dumps
  contain personal data — treat as sensitive; do not commit to git or share.

## Also back up (not in the SQL dump)

| Asset | How | Frequency |
|---|---|---|
| Storage bucket objects (avatars, posts, listings, provider-id-docs, message-files) | Supabase dashboard export, or `supabase storage` CLI / S3 API per bucket | Weekly + before cutover |
| Edge Function code | Already in-repo under `supabase/functions/**` (git) | Covered by git |
| Railway env vars | Record the KEY NAMES; store secret VALUES in a password manager | On change |
| Stripe config | Products/prices/webhooks live in Stripe; export product catalog before live cutover | Before cutover |

## Validation (performed 2026-08-27)

Restored `paws-prod-…-20260826T225718Z.dump` into a throwaway local PG17 cluster
(never touching prod). Result: `profiles=112, dog_listings=3, conversations=3,
messages=9, products=10, 188 public RLS policies` restored. The only errors were
4 `supabase_vault` extension objects, which are **expected** when restoring to
vanilla Postgres and **do not occur** when restoring to a real Supabase project
(vault is present there) — no PAWS app data depends on them.

## Restore target note

The real recovery target is a Supabase Postgres (which already has `auth`,
`storage`, `vault`, roles `anon`/`authenticated`/`service_role`, and extensions).
Restore with `pg_restore --no-owner` against that DB. See `PAWS_ROLLBACK_RUNBOOK.md`
for the full recovery decision tree.

## OWNER ACTIONS

- Consider upgrading the Supabase plan to enable **daily automated backups + PITR**
  before public launch (removes reliance on manual dumps).
- Decide backup storage location + retention and who runs the daily dump.
