import { test, expect } from '@playwright/test';

/**
 * TASK 2 — P0 critical paths (automated smoke).
 * Complements: master-flow.spec.ts (marketplace guest + optional auth), lost-and-found.spec.ts.
 *
 * Env: E2E_EMAIL + E2E_PASSWORD for extended signed-in checks (reuse master-flow optional tests).
 */

test.describe('P0 — API smokes', () => {
  test('GET /api/services/search returns success shape', async ({ request }) => {
    const res = await request.get('/api/services/search');
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as { success?: boolean; data?: unknown[]; count?: number };
    expect(body).toMatchObject({
      success: true,
      data: expect.any(Array),
      count: expect.any(Number),
    });
  });

  test('GET /api/health returns ok when database is configured', async ({ request }) => {
    const res = await request.get('/api/health');
    const text = await res.text();
    if (res.status() === 503) {
      test.skip(true, 'Database unavailable (503) — set DATABASE_URL for full P0 health check');
    }
    expect(res.ok(), text).toBeTruthy();
    const body = JSON.parse(text) as { status?: string };
    expect(body.status).toBe('ok');
  });
});

test.describe('P0 — Public pages load', () => {
  test('GET /auth shows sign-in entry', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible({ timeout: 30_000 });
  });

  test('GET /help-center loads', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/help-center', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
  });

  test('GET /explore eventually shows explore UI (guest)', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible({ timeout: 60_000 });
  });
});
