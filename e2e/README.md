# E2E tests (Playwright)

## Run locally

1. Install browsers once: `npx playwright install chromium`
2. From the repo root, either:
   - **Auto-start server:** `npm run test:e2e` (starts `npm run dev:3000` and waits for `http://127.0.0.1:3000`)
   - **Manual server:** run `npm run dev` or `npm run dev:3000` in one terminal, then skip spawning the test runner’s dev server:

     `PLAYWRIGHT_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e`

## Master flow (`e2e/master-flow.spec.ts`)

Covers the product checklist at a high level:

- **Guest:** `/marketplace` shows demo listings; clicking a preview card or **Unlock full access** goes to `/auth?mode=signup` (and `next` includes marketplace where applicable).
- **API smoke:** `GET /api/services/search` returns `{ success, data, count }`.
- **Optional (signed-in):** set `E2E_EMAIL` and `E2E_PASSWORD` to a **verified** test user. Tests sign in and assert the guest banner is gone on marketplace.

## Env

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Default `http://127.0.0.1:3000` in `playwright.config.ts` (matches auto-started `dev:3000`). |
| `PLAYWRIGHT_NO_SERVER` | Set to `1` to skip spawning `npm run dev` (you started it yourself) |
| `PLAYWRIGHT_FORCE_NEW_SERVER` | Set to `1` to always try to start the dev server (fails if port busy) |
| `E2E_EMAIL` / `E2E_PASSWORD` | Optional verified account for optional signed-in tests in `master-flow.spec.ts` |

Deeper flows (create stud/transport listing, messaging persistence, notification routing) still need manual QA or extra fixtures; the spec file comments list those steps.
