import { test, expect } from '@playwright/test';

/** 1×1 transparent PNG (valid image for POST /ai-match body). */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Lost & Found (smoke)', () => {
  test('page loads, feed visible, guest map + filters gate; public feed API returns alerts', async ({ page }) => {
    await page.goto('/lost-and-found', { waitUntil: 'load' });

    await expect(page.getByTestId('lost-found-title')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('lost-found-feed-heading')).toBeVisible();

    // Guest UX: default map + sign-in overlay on filters
    await expect(
      page.getByText(/Map list: tap a row for details|switch to list view/i),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Sign in to use filters.*list view/i }),
    ).toBeVisible();

    // Guest can switch to list view without signing in (browse-only)
    const toList = page.getByRole('button', { name: 'Map view, switch to list view' }).first();
    await toList.click();
    await expect(page.getByRole('button', { name: 'List view, switch to map view' }).first()).toBeVisible();
    await expect(page.getByText(/Browsing as a guest/i)).toBeVisible();

    // Same-origin fetch (matches how the client loads the feed)
    const api = await page.evaluate(async () => {
      const r = await fetch('/api/lost-pet-alerts');
      let body: unknown = null;
      try {
        body = await r.json();
      } catch {
        body = null;
      }
      return { status: r.status, body };
    });
    expect(
      api.status >= 200 && api.status < 300,
      `GET /api/lost-pet-alerts expected 2xx, got ${api.status}`,
    ).toBeTruthy();
    expect(api.body).toMatchObject({ alerts: expect.any(Array) });
  });

  test('guest: AI Match sends user to greeting (sign-in gate)', async ({ page }) => {
    await page.goto('/lost-and-found', { waitUntil: 'load' });
    await expect(page.getByTestId('lost-found-title')).toBeVisible({ timeout: 15_000 });

    await page.getByTestId('lf-ai-match-trigger').click();
    await expect(page).toHaveURL(/\/greeting/, { timeout: 10_000 });
  });
});

test.describe('Lost & Found — AI Match API', () => {
  test('POST /api/lost-pet-alerts/ai-match returns 400 without image', async ({ request }) => {
    const res = await request.post('/api/lost-pet-alerts/ai-match', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), await res.text()).toBe(400);
  });

  test('POST /api/lost-pet-alerts/ai-match returns matches + matchRanking', async ({ request }) => {
    const res = await request.post('/api/lost-pet-alerts/ai-match', {
      data: { image: TINY_PNG_BASE64 },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(
      res.ok(),
      `expected 2xx, got ${res.status()}: ${(await res.text()).slice(0, 500)}`,
    ).toBeTruthy();
    const body = (await res.json()) as { matches?: unknown; matchRanking?: string };
    expect(body).toMatchObject({ matches: expect.any(Array) });
    expect(['visual', 'proximity', 'empty']).toContain(body.matchRanking);
  });
});
