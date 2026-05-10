# Store hero images → Stripe product id

Place PNG files in `client/public/products/` using the Stripe **Product id** as the filename.

| Stripe Product ID | Source asset (staging) | Notes |
|-------------------|------------------------|--------|
| `prod_USRUunXPhQp1Yk` | hedgehogs pack shot | ZippyPaws Miniz 3 Pack |
| `prod_USRR9aXU62P4rX` | fish bone (purple) | Featured |
| `prod_USREY8rPxycmF7` | mini lamb chop | |
| `prod_USRCfiXAucvR7E` | _(missing)_ | Add `prod_USRCfiXAucvR7E.png` when available (eMat) |
| `prod_USR838JxXLxtx0` | Donutz pink packshot | Featured |
| `prod_USR7XPz0sXh11t` | Messy Mutts travel bowl | |
| `prod_USR0Nq9QMckOyn` | Barkworthies trachea bag | Gallery: `prod_USR0Nq9QMckOyn_g1.png` … `_g5.png` |
| `prod_USQxZZxRpYVbka` | PlaqueOff dental bones bag | |
| `prod_URoE7Sadw6NG1r` | Etta peanut butter display | |
| `prod_URndh1k6a89Td6` | Barkworthies duck feet display | |

DB primary key is a **UUID v5** derived from the Stripe product id (see `scripts/sync-store-catalog-from-csv.ts`). `image_url` still uses `/products/prod_….png`.
