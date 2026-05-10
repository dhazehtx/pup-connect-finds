import { test, expect } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD, E2E_PEER_USER_ID, hasPrimaryCredentials } from './helpers/e2eEnv';
import { signInWithEmailPassword, getSupabaseAccessToken } from './helpers/signIn';

test.describe('P0 — Messaging thread', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(!hasPrimaryCredentials, 'Set E2E_EMAIL and E2E_PASSWORD');
    testInfo.skip(!E2E_PEER_USER_ID, 'Set E2E_PEER_USER_ID (UUID of another user with a profile)');
  });

  test('find-or-create conversation then send a message', async ({ page }) => {
    test.slow();
    await signInWithEmailPassword(page, E2E_EMAIL!, E2E_PASSWORD!);

    const token = await getSupabaseAccessToken(page);
    expect(token, 'Supabase session token missing after login').toBeTruthy();

    const res = await page.request.post('/api/messaging/conversations/find-or-create', {
      data: { seller_id: E2E_PEER_USER_ID },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as { id?: string; conversationId?: string };
    const conversationId = body.conversationId || body.id;
    expect(conversationId, 'conversation id from API').toBeTruthy();

    await page.goto(`/messages/${conversationId}`, { waitUntil: 'domcontentloaded' });

    const input = page.getByPlaceholder(/Type a message/i);
    await expect(input).toBeVisible({ timeout: 30_000 });

    const text = `e2e-${Date.now()}`;
    await input.fill(text);
    await input.press('Enter');

    await expect(page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 30_000 });
  });
});
