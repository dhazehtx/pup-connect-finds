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
| Build | `npm ci && npm run build` |
| Start | `npm start` → `node dist/index.js` |
| Env | `DATABASE_URL`, Stripe keys, `STRIPE_WEBHOOK_SECRET`, `BASE_URL`, Supabase keys if used, session secret, etc. |

**Stripe webhook:** `https://<your-host>/api/webhooks/stripe` — paste the signing secret into env.

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

## Supplier / wholesale “company website”

Use any **public HTTPS** URL that opens in a browser (your `BASE_URL` or a landing page). Do not use `localhost`.
