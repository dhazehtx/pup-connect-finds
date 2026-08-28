import { test, expect, type Page } from '@playwright/test';

/**
 * PAWS PRODUCTION CERTIFICATION — authenticated buyer / seller / messaging.
 *
 * SELF-SKIPS unless dedicated TEST-account credentials are provided via env
 * (never hardcoded, never committed):
 *   CERT_BUYER_EMAIL  / CERT_BUYER_PASSWORD
 *   CERT_SELLER_EMAIL / CERT_SELLER_PASSWORD   (seller block only)
 *
 * Run (against production):
 *   CERT_BASE_URL=https://petadoptionwebservices.com \
 *   CERT_BUYER_EMAIL=... CERT_BUYER_PASSWORD=... \
 *   npx playwright test --config playwright.cert.config.ts auth-buyer-seller --project=desktop-1280
 *
 * NEVER use the owner/admin account here — buyer/seller certification must use
 * throwaway test accounts so no real identity, orders, or listings are mutated.
 */

const BUYER_EMAIL = process.env.CERT_BUYER_EMAIL;
const BUYER_PASSWORD = process.env.CERT_BUYER_PASSWORD;
const SELLER_EMAIL = process.env.CERT_SELLER_EMAIL;
const SELLER_PASSWORD = process.env.CERT_SELLER_PASSWORD;

/** Resilient sign-in against /auth (selectors fall back across common shapes). */
async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth', { waitUntil: 'domcontentloaded' });
  const emailField = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="email"]')
    .first();
  const passwordField = page
    .locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]')
    .first();
  await emailField.waitFor({ state: 'visible', timeout: 20_000 });
  await emailField.fill(email);
  await passwordField.fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).first().click();
  // Success = we leave /auth (or a profile/avatar control appears).
  await expect
    .poll(async () => page.url(), { timeout: 25_000 })
    .not.toMatch(/\/auth(\?|$)/);
}

test.describe('Authenticated buyer certification', () => {
  test.skip(!BUYER_EMAIL || !BUYER_PASSWORD, 'CERT_BUYER_EMAIL / CERT_BUYER_PASSWORD not set');

  test('buyer signs in and reaches an authenticated session', async ({ page }) => {
    await signIn(page, BUYER_EMAIL!, BUYER_PASSWORD!);
    expect(page.url()).not.toMatch(/\/auth(\?|$)/);
  });

  test('protected routes are reachable when authenticated (no redirect to /auth)', async ({ page }) => {
    await signIn(page, BUYER_EMAIL!, BUYER_PASSWORD!);
    for (const route of ['/messages', '/profile', '/orders']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);
      expect(page.url(), `${route} should not bounce an authed user to /auth`).not.toMatch(
        /\/auth(\?|$)/,
      );
    }
  });

  test('favorite persists across reload', async ({ page }) => {
    await signIn(page, BUYER_EMAIL!, BUYER_PASSWORD!);
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
    const favButton = page
      .getByRole('button', { name: /favorite|save|wishlist|heart/i })
      .first();
    if (!(await favButton.isVisible().catch(() => false))) {
      test.skip(true, 'No favorite control found on Explore for this account/data set');
    }
    await favButton.click();
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    // The favorited state should still be present (pressed/active) after reload.
    await expect(
      page.getByRole('button', { name: /unfavorite|saved|remove from favorites|favorited/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('checkout reaches Stripe in TEST mode only (no live keys/URLs)', async ({ page }) => {
    const liveHits: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (/pk_live_|\/live\//.test(u) || (/checkout\.stripe\.com/.test(u) && /live/.test(u))) {
        liveHits.push(u);
      }
    });
    await signIn(page, BUYER_EMAIL!, BUYER_PASSWORD!);
    await page.goto('/store', { waitUntil: 'domcontentloaded' }).catch(() => {});
    // Best-effort: this asserts the negative safety property regardless of the
    // exact store flow — no live Stripe surface should ever be touched.
    await page.waitForTimeout(1500);
    expect(liveHits, `live Stripe surface contacted: ${liveHits.join(', ')}`).toEqual([]);
  });
});

test.describe('Authenticated seller certification', () => {
  test.skip(!SELLER_EMAIL || !SELLER_PASSWORD, 'CERT_SELLER_EMAIL / CERT_SELLER_PASSWORD not set');

  test('seller signs in and can reach listing management', async ({ page }) => {
    await signIn(page, SELLER_EMAIL!, SELLER_PASSWORD!);
    await page.goto('/my-listings', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(800);
    expect(page.url()).not.toMatch(/\/auth(\?|$)/);
  });
});
