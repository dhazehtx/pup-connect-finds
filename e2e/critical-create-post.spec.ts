import { test, expect } from '@playwright/test';
import { hasPrimaryCredentials, E2E_EMAIL, E2E_PASSWORD } from './helpers/e2eEnv';
import { signInWithEmailPassword } from './helpers/signIn';
import { getTinyPngPath } from './helpers/tinyImage';

test.describe('P0 — Create post', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasPrimaryCredentials, 'Set E2E_EMAIL and E2E_PASSWORD');
  });

  test('signed-in user creates a photo post from profile (desktop)', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1400, height: 900 });

    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!, { nextPath: '/profile' });
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Post', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Create Post' })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /Add Photo/i }).click();
    await page.locator('input[type="file"]').setInputFiles(getTinyPngPath());

    await page.getByPlaceholder(/What's on your mind/i).fill(`E2E post ${Date.now()}`);

    await page.getByRole('button', { name: /Share Post/i }).click();

    await expect(page.getByText(/Post created|shared successfully/i)).toBeVisible({ timeout: 60_000 });
  });
});
