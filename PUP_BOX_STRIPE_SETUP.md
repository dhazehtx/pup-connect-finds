# Pup Box Stripe Setup (current implementation)

## Summary

The Pup Box tab loads plans from **`GET /api/pupbox/plans`**, which reads **`PUPBOX_CATALOG_JSON`** on the server. Each SKU must exist in the Postgres `products` table with deterministic ids (UUID v5 of the Stripe Product id).

## Steps

1. Create **six** Stripe Products (three sizes × subscription + one‑time). Note each **Product id** (`prod_…`) and **Price id** (`price_…`).
2. Set **`PUPBOX_CATALOG_JSON`** in the server environment. Required **key** values:

   - `small_subscription`, `small_one_time`
   - `medium_subscription`, `medium_one_time`
   - `large_subscription`, `large_one_time`

3. Run **`npm run store:sync-catalog`** so main store CSV **and** Pup Box env rows are upserted into `products`.
4. Restart the API. In the app, open Marketplace → Pup Box; the yellow notice should disappear and **Add to cart** should use real product ids.
5. **Checkout rules:** subscription and one‑time items **cannot** share one checkout session. The cart blocks mixed Store subscription + one‑time; keep Pup Box subscription lines separate from one‑time lines.

## JSON shape

```json
[
  {
    "key": "small_subscription",
    "stripeProductId": "prod_...",
    "stripePriceId": "price_...",
    "amount": "19.99",
    "recurring": true,
    "name": "Small Pup Box Monthly"
  }
]
```

Optional per row: `"currency": "usd"`.

## Webhooks

Stripe Checkout completion is handled on **`POST /api/webhooks/stripe`** (and mirrored on **`POST /api/stripe/webhook`**). Subscription checkouts create a row in `subscriptions` when `checkout.session.completed` fires with `mode=subscription`.
