# Cron jobs (price alerts & back-in-stock)

The app exposes internal jobs that should be called on a schedule so users get price and back-in-stock notifications.

## Endpoint

- **URL:** `POST /api/jobs/run-all` or `GET /api/jobs/run-all` (same handler)
- **Auth:** Send one of:
  - Header: `Authorization: Bearer <CRON_SECRET>`
  - Header: `x-cron-secret: <CRON_SECRET>`
- **CRON_SECRET:** Set in env (e.g. `CRON_SECRET=your-random-secret`). If unset, falls back to `VAPID_PRIVATE_KEY` or a dev default.

## What it does

1. **Price alerts** – For each saved price alert, if the listing’s current price is at or below the user’s target, sends a notification and removes the alert.
2. **Back-in-stock** – For each back-in-stock alert where the product has inventory again, sends a notification and marks the alert as notified.

## Setting up a schedule

Run the endpoint on a fixed schedule (e.g. every 15–60 minutes).

### Option 1: Cron (Linux / server)

```bash
# Every 30 minutes
*/30 * * * * curl -s -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.com/api/jobs/run-all
```

### Option 2: Vercel Cron (vercel.json)

```json
{
  "crons": [{ "path": "/api/jobs/run-all", "schedule": "*/30 * * * *" }]
}
```

Your server route for `/api/jobs/run-all` must read `CRON_SECRET` from env and validate the request (Vercel may send a secret header; check their docs).

### Option 3: External cron service

Use a service (e.g. cron-job.org, EasyCron) to call:

- **Method:** GET or POST  
- **URL:** `https://your-production-domain.com/api/jobs/run-all`  
- **Header:** `Authorization: Bearer YOUR_CRON_SECRET` (or `x-cron-secret: YOUR_CRON_SECRET`)

## Response

- **200:** `{ "ok": true, "priceAlerts": { "processed": N, "sent": M }, "backInStock": { "processed": N, "sent": M } }`
- **401:** Missing or invalid secret
