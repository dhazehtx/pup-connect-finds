import { test, expect } from '@playwright/test';
import { hasPrimaryCredentials, E2E_EMAIL, E2E_PASSWORD } from './helpers/e2eEnv';
import { signInWithEmailPassword } from './helpers/signIn';

test.describe('Booking modal slot flow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasPrimaryCredentials, 'Set E2E_EMAIL and E2E_PASSWORD');
  });

  test('loads slots and shows conflict toast on 409', async ({ page }) => {
    await page.route('**/api/services/provider/**/available-slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            providerId: '00000000-0000-0000-0000-000000000001',
            date: '2030-01-01',
            durationMinutes: 60,
            slots: [
              {
                startAt: '2030-01-01T10:00:00.000Z',
                endAt: '2030-01-01T11:00:00.000Z',
                available: true,
              },
            ],
          },
        }),
      });
    });

    await page.route('**/api/services/book/**', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'slot_unavailable',
          error: 'Selected slot is no longer available',
        }),
      });
    });

    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!, { nextPath: '/services' });
    await page.goto('/services', { waitUntil: 'domcontentloaded' });

    const openModalButton = page.getByRole('button', { name: /book service|book/i }).first();
    await expect(openModalButton).toBeVisible({ timeout: 20_000 });
    await openModalButton.click();

    await expect(page.getByRole('heading', { name: /Book Service/i })).toBeVisible({ timeout: 10_000 });

    await page.locator('#service_date').fill('2030-01-01');
    await page.getByRole('combobox').nth(1).click(); // duration select
    await page.getByRole('option', { name: /1 hour/i }).click();
    await page.getByRole('combobox').nth(2).click(); // slot select
    await page.getByRole('option').first().click();

    await page.getByLabel(/I agree to the service terms/i).check();
    await page.getByRole('button', { name: /Send Booking Request/i }).click();

    await expect(page.getByText(/Slot unavailable/i)).toBeVisible({ timeout: 10_000 });
  });
});
