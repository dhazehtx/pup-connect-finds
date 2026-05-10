# Store product images

Hero images for the marketplace Store tab are served as static files:

- Filename: `<stripe_product_id>.png` (e.g. `prod_USRUunXPhQp1Yk.png`)
- URL in the database: `/products/<stripe_product_id>.png`

The database row `products.id` is a **deterministic UUID** (v5) derived from the Stripe product id (Postgres UUID column). `stripe_product_id` stores the original `prod_…` string. Re-run the sync script after CSV changes; ids stay stable.

Human-readable mapping (staging filenames): `scripts/data/store/IMAGE_MAP.md` (repo root).

Optional gallery assets for carousels (e.g. trachea): `prod_<id>_g1.png` … paths stored in `products.metadata.gallery`.

Regenerate DB rows from Stripe CSV exports:

```bash
npm run store:sync-catalog
```

Requires `DATABASE_URL` or `NEON_DATABASE_URL` and `scripts/data/store/products.csv` + `prices.csv`.
