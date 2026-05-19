# Deploy PAWS (public URL)

PAWS runs as **one Node process**: Express serves the **API** (`/api/...`) and, in production, the **built React app** from `dist/public` after `npm run build`.

## Requirements

1. **Node 20+** and a host with a public **HTTPS** URL.
2. **Postgres** — set `DATABASE_URL` (e.g. Neon, Supabase pooler).
3. **Secrets** at runtime — see [`.env.example`](./.env.example) and [`LAUNCH_BETA_CHECKLIST.md`](./LAUNCH_BETA_CHECKLIST.md) (payments / webhooks).
4. **`BASE_URL`** — public origin **without** a trailing slash, e.g. `https://paws.example.com`. Used for Stripe Checkout return URLs and similar.

## Build and start

```bash
npm ci
npm run build
NODE_ENV=production PORT=8080 BASE_URL=https://your-app.example.com node dist/index.js
```

On PaaS, use the platform’s **`PORT`** env var. Apply DB migrations to the same database before serving traffic.

## Typical PaaS (Railway, Render, Fly.io, etc.)

| Setting | Value |
|--------|--------|
| Build | **`npm run build`** only when the host already runs install (e.g. Railway **Railpack**). For a blank VM/Dockerfile, use `npm ci && npm run build`. |
| Start | **`npm start`** → `NODE_ENV=production node dist/index.js` (do **not** use `vite preview` in production). |
| Env | `DATABASE_URL`, Stripe keys, `STRIPE_WEBHOOK_SECRET`, `BASE_URL`, Supabase keys if used, etc. |

**Stripe webhook:** `https://<your-host>/api/webhooks/stripe` — paste the signing secret into env.

### Railway checklist (this repo)

Repo root includes [`railway.toml`](./railway.toml) (`npm run build`, `npm start`, healthcheck `/api/health/live`). If the dashboard still shows an old **start** command, clear it or set it to **`npm start`** and save.

1. **One service for the public app**  
   If you have a duplicate service (e.g. `gracious-healing`) also connected to the same GitHub repo, remove it or disconnect GitHub so you only maintain the service that owns **`petadoptionwebservices.com`**.

2. **Branch**  
   Connect **`main`** and keep **auto-deploy** on (optional: “Wait for CI” only if GitHub Actions is green).

3. **Build command (dashboard)**  
   **`npm run build`** only — Railpack runs `npm ci` / install **before** this; do not prepend `npm ci &&` here (avoids `EBUSY` on `node_modules/.vite`).

4. **Start command (dashboard)**  
   **`npm start`** — not `npm run preview …`. Preview does not run Express or your API.

5. **Healthcheck**  
   Path **`/api/health/live`**. Timeout **120s** is fine for first boot.

6. **Variables on the service** (minimum for a working site)  
   - **`DATABASE_URL`** — real Postgres URI from Supabase **Project Settings → Database** (or Neon). Not a placeholder host.  
   - **`BASE_URL`** — `https://petadoptionwebservices.com` (no trailing slash). Use **`BASE_URL`**, not `NEXT_PUBLIC_BASE_URL` (this app is not Next.js).  
   - **`VITE_SUPABASE_URL`** and **`SUPABASE_SERVICE_ROLE_KEY`** (and anon key if the client needs it) — same Supabase project as the DB.  
   Add Stripe and the rest from [`.env.example`](./.env.example) / [`.env.staging.example`](./.env.staging.example) as you enable payments.

7. **Confirm the live release**  
   In **Deployments**, open the **ACTIVE** (green) row: its **commit SHA** should match **GitHub `main`**. **Deploy logs** should show **`npm start`** / **`node dist/index.js`**, not `vite preview` or an old template name.

8. **Stripe (after the app is on `npm start` + real `DATABASE_URL`)**  
   - Railway: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (and any Pup Box / fee vars from docs).  
   - Stripe Dashboard → Developers → Webhooks: URL **`https://petadoptionwebservices.com/api/webhooks/stripe`**, then paste the **signing secret** into `STRIPE_WEBHOOK_SECRET`.  
   - Use **test** keys until you intentionally switch to **live** for real-money beta.

## Custom domain

Attach the domain in the host UI (HTTPS usually automatic). Update **`BASE_URL`** and redeploy.

## Split CDN frontend vs this repo

By default the SPA calls **same-origin** `/api`. Hosting only static files elsewhere requires pointing the client at your API and handling CORS/cookies. **One Node deployment** for UI + API is the simplest first step.

## Capacitor (iOS / Android)

See [`capacitor.config.json`](./capacitor.config.json). **`webDir`** is `dist/public` (matches Vite in [`vite.config.ts`](./vite.config.ts)).

```bash
npm install
npm run build:web
npx cap add ios      # macOS + Xcode
npx cap add android  # Android Studio
npx cap sync
```

Production apps must call your **deployed** API, not `localhost`.

## Schema migrations (media + messaging)

After pulling changes that add `supabase/migrations/20260519000000_media_assets.sql` and `20260519000001_conversation_participants.sql`, run both files in order in the **Supabase SQL Editor** on the same project as `DATABASE_URL`. Without these tables, profile photo upload (`Failed to commit media`) and the Message button (`MSG_FAILED`) will fail.

## Supplier / wholesale “company website”

Use any **public HTTPS** URL that opens in a browser (your `BASE_URL` or a landing page). Do not use `localhost`.
