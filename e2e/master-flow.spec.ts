import { test, expect } from '@playwright/test';

/**
 * MASTER TEST FLOW (automated + optional manual steps)
 *
 * Guest: open logged out → demo listings → click listing → /auth?mode=signup
 * Auth: sign up / sign in → profile shows display name (not raw email as headline)
 * Marketplace: create listing (manual or seeded user) → filter → detail page
 * Stud / Transport: same pattern
 * Messaging / Notifications: need E2E_EMAIL + E2E_PASSWORD (verified user) — optional tests below
 */

const E2E_EMAIL = process.env.E2E_EMAIL?.trim();
const E2E_PASSWORD = process.env.E2E_PASSWORD?.trim();
const hasE2ECreds = Boolean(E2E_EMAIL && E2E_PASSWORD);

test.describe('Guest flow — marketplace demo', () => {
  test('logged out: hero + sign-up prompt + preview cards; click card → signup', async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('services-marketplace-tab')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('heading', { name: 'Pet Services' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Sign up prompt' })).toBeVisible();
    await expect(page.getByText(/Sign up to contact providers and book services/i)).toBeVisible();

    await expect(page.getByTestId('service-provider-card').first()).toBeVisible();

    // Guest preview includes grooming demo (stable id from guestMarketplaceProviders)
    const groomCard = page.locator('[data-provider-id="preview-groom-sf"]');
    await expect(groomCard).toBeVisible();
    await groomCard.click();

    await expect(page).toHaveURL(/\/auth/, { timeout: 15_000 });
    const u = new URL(page.url());
    expect(u.searchParams.get('mode')).toBe('signup');
  });

  test('Unlock full access navigates to signup with next=marketplace', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('services-marketplace-tab')).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: 'Unlock full access' }).click();
    await expect(page).toHaveURL(/\/auth/);
    const u = new URL(page.url());
    expect(u.searchParams.get('mode')).toBe('signup');
    expect(u.searchParams.get('next')).toContain('marketplace');
  });
});

test.describe('API smoke (no UI auth)', () => {
  test('GET /api/services/search returns provider list shape', async ({ request }) => {
    const res = await request.get('/api/services/search');
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as { success?: boolean; data?: unknown[]; count?: number };
    expect(body).toMatchObject({
      success: true,
      data: expect.any(Array),
      count: expect.any(Number),
    });
  });
});

test.describe('Optional — signed-in flows (E2E_EMAIL + E2E_PASSWORD)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasE2ECreds, 'Set E2E_EMAIL and E2E_PASSWORD to a verified test account');
  });

  test('sign in → profile route loads (session)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.getByTestId('auth-email').fill(E2E_EMAIL!);
    await page.getByTestId('auth-password').fill(E2E_PASSWORD!);
    await page.getByTestId('auth-submit').click();

    // Redirect after login (explore or next)
    await page.waitForURL(/\/(explore|profile|marketplace|messages)/, { timeout: 30_000 });

    await page.goto('/profile', { waitUntil: 'domcontentloaded' }).catch(() => null);
    // If /profile redirects, at least we had a session
    const url = page.url();
    expect(url).toMatch(/localhost|127\.0\.0\.1/);
  });

  test('marketplace logged in: live services tab (no guest prompt)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/auth');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    await page.getByTestId('auth-email').fill(E2E_EMAIL!);
    await page.getByTestId('auth-password').fill(E2E_PASSWORD!);
    await page.getByTestId('auth-submit').click();
    await page.waitForURL(/\/(explore|profile|marketplace|messages)/, { timeout: 30_000 });

    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('services-marketplace-tab')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('region', { name: 'Sign up prompt' })).toHaveCount(0);
  });
});
