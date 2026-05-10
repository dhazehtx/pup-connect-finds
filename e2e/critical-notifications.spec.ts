import { test, expect } from '@playwright/test';
import {
  E2E_EMAIL,
  E2E_PASSWORD,
  E2E_PEER_USER_ID,
  E2E_PEER_EMAIL,
  E2E_PEER_PASSWORD,
  hasPrimaryCredentials,
  hasPeerCredentials,
} from './helpers/e2eEnv';
import { signInWithEmailPassword, getSupabaseAccessToken } from './helpers/signIn';

test.describe('P0 — Notifications', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasPrimaryCredentials, 'Set E2E_EMAIL and E2E_PASSWORD');
  });

  test('notifications page loads for signed-in user', async ({ page }) => {
    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!);
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({ timeout: 30_000 });
  });

  test('GET /api/notifications returns array with bearer token', async ({ page }) => {
    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!);

    const result = await page.evaluate(async () => {
      const keys = Object.keys(localStorage);
      const authKey = keys.find((k) => k.includes('auth-token') && k.startsWith('sb-'));
      if (!authKey) return { error: 'no_auth_key' };
      const raw = localStorage.getItem(authKey);
      if (!raw) return { error: 'no_raw' };
      const session = JSON.parse(raw) as { access_token?: string };
      const t = session.access_token;
      if (!t) return { error: 'no_token' };
      const r = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${t}` } });
      const json = await r.json();
      return { status: r.status, body: json };
    });

    if ('error' in result && result.error) {
      throw new Error(`Session/token: ${result.error}`);
    }
    expect(result.status, JSON.stringify(result)).toBe(200);
    expect(Array.isArray(result.body)).toBeTruthy();
  });

  test('follow peer triggers notification for peer (second account)', async ({ browser }) => {
    test.slow();
    test.skip(!hasPeerCredentials, 'Set E2E_PEER_EMAIL, E2E_PEER_PASSWORD, E2E_PEER_USER_ID');

    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await signInWithEmailPassword(pageA, E2E_EMAIL!, E2E_PASSWORD!);

    const token = await getSupabaseAccessToken(pageA);
    expect(token).toBeTruthy();

    const followRes = await pageA.request.post('/api/follows', {
      data: { followed_id: E2E_PEER_USER_ID },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(followRes.ok(), await followRes.text()).toBeTruthy();

    await ctxA.close();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await signInWithEmailPassword(pageB, E2E_PEER_EMAIL!, E2E_PEER_PASSWORD!);
    await pageB.goto('/notifications', { waitUntil: 'domcontentloaded' });

    await expect(
      pageB.getByText(/New Follower|started following you/i).first(),
    ).toBeVisible({ timeout: 45_000 });

    await ctxB.close();
  });
});
