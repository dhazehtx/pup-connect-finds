# PAWS Final Owner Inputs

Only **owner-required** items remain below. The product shell (routes, layouts, placeholder policies, Help Center, marketplace tab URLs, `/shop` redirect) is implemented in code—replace illustrative copy and credentials with your final business decisions.

## Supabase / Infra
- Confirm project health remains **Healthy** in the Supabase dashboard.
- Confirm SQL editor query `select now();` returns immediately.
- Confirm local env values match the dashboard project:
  - `VITE_SUPABASE_URL` / `SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- If intermittent timeouts recur, verify VPN/firewall/adblock are not blocking Supabase.

## Stripe / Checkout
- Confirm **live vs test** mode for launch.
- Map **Stripe Price IDs** to catalog items (store + Pup Box). Replace placeholders in `PupBoxSubscription` (`PUP_BOX_PRODUCTS`) and admin/store product records with real IDs.
- Verify **webhook endpoint** + signing secret in the Stripe dashboard.
- Run one **end-to-end** purchase and confirm order/webhook handling.
- Confirm **payout/account** details and business tax/compliance settings.

## Store Commercial Decisions
- Final **product names** and launch assortment.
- Final **prices** and discount rules.
- Final **subscription tier** configuration and billing cadence.
- Final **recurring vs one-time** product mapping.

## Fulfillment / Operations
- **Supplier** assignment per SKU (domestic vs international).
- Final **shipping SLA** language (processing time, carriers, regions)—the in-app **Shipping** and **Returns** pages are structured placeholders; align them with real operations and counsel.
- Final **return/refund** rules (windows, restocking, exclusions).
- **Support inbox** (e.g. `support@…`) and escalation owner—Help Center and Contact can link to these once published.
- **Contact form:** `/contact` currently acknowledges submission in-app; wire `POST` to your CRM, helpdesk, or email relay when ready (owner configures endpoint and spam controls).

## Optional technical cleanup (non-blocking)
- Remove the unused **`wouter`** dependency from `package.json` after a full smoke test—the client app now routes exclusively with **React Router**; the package may still be listed until you confirm no external tooling relies on it.

---

## Handoff — final Cursor pass (summary)

**Completed in code (no owner action):** Support tickets UI now calls `apiRequest` correctly (parsed JSON), with loading/error/empty states and Contact/Help links; marketplace store empty/error states; cart continuity (titles, subtotal copy, image fallback, store deep link); marketplace page title; listing/service card borders aligned with design system; contact form path unchanged (still logs until backend wired).

**Still owner-only:** Stripe live, real catalog, legal text, deployment, support inbox + **contact/ticket email delivery**, pricing, assets, release sign-off.

**External/platform:** Stripe Dashboard, DNS/hosting, email (SPF/DKIM), production smoke tests.

**Deferred:** Removing `wouter` from `package.json`; optional deep notification-system fixes from MVP dashboard (separate from this pass).

## Legal / Trust Copy (Final Approval)
- **Terms of Service** and **Privacy Policy**—replace any legacy “My Pup” naming and dates with PAWS legal final text.
- **Shipping** and **Returns** pages—swap illustrative timelines and rules for attorney-approved language.
- **Community guidelines** and safety messaging—final sign-off.

## Marketing Launch Inputs
- Final launch offer (if any).
- Final **social handles** and landing CTA links.
- Final **hero/product** imagery and brand assets.

## Release Gate
- Approve final Red/Yellow/Green board.
- Approve checkpoint commit / release tag.

## Platform / Account Actions (Require Your Login)
- Stripe Dashboard (products, webhooks, tax).
- Domain/DNS and production hosting.
- Email sending domain (SPF/DKIM) for transactional mail.
- Any third-party fulfillment or inventory integrations.
