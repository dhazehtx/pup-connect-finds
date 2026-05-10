import { test, expect } from '@playwright/test';
import { hasPrimaryCredentials, E2E_EMAIL, E2E_PASSWORD } from './helpers/e2eEnv';
import { signInWithEmailPassword } from './helpers/signIn';

test.describe('P0 — Provider onboarding modal', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasPrimaryCredentials, 'Set E2E_EMAIL and E2E_PASSWORD');
  });

  test('opens Become a provider, selects service, reaches step 2', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1280, height: 900 });

    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!, { nextPath: '/marketplace' });
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /Become a service provider/i }).click();

    await expect(page.getByRole('heading', { name: /Become a Service Provider/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByTestId('provider-service-option-walking').click();

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('heading', { name: /Details for each service/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
